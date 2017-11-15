import mongoose from 'mongoose';
import Document from './document.model';
import Notebook from './notebook.model';
import Promise from 'bluebird';

let partSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	position: {
		type: Number,
		required: true,
		get: v => Math.round(v),
		set: v => Math.round(v)
	},
	notebook: {type: mongoose.Schema.Types.ObjectId, ref: 'Notebook'},
  documents: [{type: mongoose.Schema.Types.ObjectId, ref:'Document'}]
});

partSchema.pre('save', function (next) {
	Notebook.update( {_id: this.notebook}, { $addToSet: {parts: this._id } } )
	.then(( (notebooks) => next() ))
	.error(( (err) => next(err) ));
});

partSchema.pre('remove', function (next) {
	Notebook.update( {_id: this.notebook}, { $pullAll: {parts: [this._id] } } )
	.then(( (notebooks) => next() ))
	.error(( (err) => next(err) ));
});

partSchema.post('save', function (part) {
	mongoose.model('Part', partSchema)
	.find({ position: part.position, _id: { $ne: part._id }, notebook: part.notebook })
	.then( function(parts) {
		return Promise.each(parts, function(part) {
			part.position++;
			return part.save();
		})
	})
	.error(( (err) => console.log(err) ));
});

export default mongoose.model('Part', partSchema);