import mongoose from 'mongoose';
import Promise from 'bluebird';
import User from './user.model';
import Document from './document.model';

let assignmentSchema = new mongoose.Schema({
	completedAt: { type: Date },
	user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	document: {type: mongoose.Schema.Types.ObjectId, ref: 'Document'}
});

assignmentSchema.pre('save', function (next) {
	Promise.all([
		User.update( {_id: this.user}, { $addToSet: {assignments: this._id } } ),
		Document.update( {_id: this.document}, { $addToSet: {assignments: this._id } } )
	])
	.then(( () => next() ))
	.error(( (err) => next(err) ));
});

assignmentSchema.pre('remove', function (next) {
	Promise.all([
		User.update( {_id: this.user}, { $pullAll: {assignments: [this._id] } } ),
		Document.update( {_id: this.document}, { $pullAll: {assignments: [this._id] } } )
	])
	.then(( () => next() ))
	.error(( (err) => next(err) ));
});

export default mongoose.model('Assignment', assignmentSchema);