import mongoose from 'mongoose';
import Part from './part.model';
import Section from './section.model';
import State from './state.model';
import Assignment from './assignment.model';
import User from './user.model';
import Notification from './notification.model';
import Promise from 'bluebird';

let documentSchema = new mongoose.Schema({
	title: { type: String },
	position: {
		type: Number,
		required: true,
		get: v => Math.round(v),
		set: v => Math.round(v)
	},
	part: {type: mongoose.Schema.Types.ObjectId, ref: 'Part'},
	sections: [{type: mongoose.Schema.Types.ObjectId, ref: 'Section'}],
	state: {type: mongoose.Schema.Types.ObjectId, ref:'State'},
	isOngoing: {
		type: Boolean,
		required: true,
		default: false
	},
  assignments: [{type: mongoose.Schema.Types.ObjectId, ref:'Assignment'}]
});

documentSchema.virtual('sendNotification').get(function() {
  return this._sendNotification;
});

documentSchema.virtual('sendNotification').set(function(sendNotification) {
  return this._sendNotification = sendNotification;
});

documentSchema.set('toObject', {
  getters: true
});

documentSchema.pre('save', function (next) {
	let self = this;
	Part.update( {documents: self._id}, { $pullAll: {documents: [self._id] } } )
	.then(function(parts) {
		return Part.update( {_id: self.part}, { $addToSet: {documents: self._id } } )
		.then( (parts) => { next(); return null; } )
		.error(( (err) => next(err) ));
	})
});

//WHEN A DOCUMENT IS SAVED, WE NEED TO POTENTIALLY CREATE NEW ASSIGNMENTS FOR IT
documentSchema.post('save', function (document) { 
	var Document = mongoose.model('Document', documentSchema);
	var states = document.state ? [null, document.state] : [null];

	states.forEach(function(state) {
		Document.find({state: null})
		.then(function(documents) {
			return [documents, (state ? User.find({state: state}) : User.find())];
		})
		.spread(function(documents, users) {
			documents.forEach(function(document) {
				users.forEach(function(user) {
					Assignment.count({
						user: user._id,
						document: document._id
					})
					.then(function(count) {
						if(count === 0) {
							Assignment.create({
							  user: user._id,
							  document: document._id
							})
							.then(( (assignments) => {} ))
							.error(( (err) => console.log(err) ))
							;
						}
					})
				});
			});
		});
	});
});

//WHEN SAVED, IF THE ADMIN WANTS TO NOTIFY USERS ABOUT THE CHANGE, CREATE NOTIFICATIONS
documentSchema.post('save', function (document) { 
	if(document.sendNotification) {
		setTimeout(function() {
			Assignment.find({document:  document._id })
			.then(function(assignments) {
				assignments.forEach(function(assignment) {
					Notification.create({
						user: assignment.user,
						message: `${document.title} has been updated`,
						data: {
							type: "Document",
							id: document._id
						}
					})
					.then(( () => {} ))
				});
			});
		}, 4000);
	}
});

documentSchema.pre('remove', function (next) {
	Part.update( {_id: this.part}, { $pullAll: {documents: [this._id] } } )
	.then(( (parts) => next() ))
	.error(( (err) => next(err) ));
});

documentSchema.post('save', function (document) {
	mongoose.model('Document', documentSchema)
	.find({ position: document.position, _id: { $ne: document._id }, part: document.part })
	.then( function(documents) {
		return Promise.each(documents, function(document) {
			document.position++;
			return document.save();
		})
	})
	.error(( (err) => console.log(err) ));
});

export default mongoose.model('Document', documentSchema);