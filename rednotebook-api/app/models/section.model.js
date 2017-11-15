import mongoose from 'mongoose';
import Document from './document.model';
import Input from './input.model';
import Promise from 'bluebird';

let sectionSchema = new mongoose.Schema({
	title: { type: String },
	description: { type: String },
	repeatable: { 
		type: Boolean,
		default: false
	},
	position: {
		type: Number,
		required: true,
		get: v => Math.round(v),
		set: v => Math.round(v)
	},
	document: {type: mongoose.Schema.Types.ObjectId, ref: 'Document'},
	master: {type: mongoose.Schema.Types.ObjectId, ref: 'Section'},
	children: [{type: mongoose.Schema.Types.ObjectId, ref:'Section'}],
	inputs: [{type: mongoose.Schema.Types.ObjectId, ref:'Input'}]
});

sectionSchema.pre('save', function (next) {
	var Section = mongoose.model('Section', sectionSchema);
	(
		this.master 
		? Section.update( {_id: this.master}, { $addToSet: {children: this._id } } )
		: Document.update( {_id: this.document}, { $addToSet: {sections: this._id } } )
	)
	.then(( (documents) => next() ))
	.error(( (err) => next(err) ));
});

sectionSchema.post('save', function (section) {
	if(section.repeatable && section.children.length < 50) {
		var Section = mongoose.model('Section', sectionSchema);
		for(var i=1; i<=50; i++) {
			var newSection = new Section();
			newSection.master = section._id;
			newSection.position = i;
			newSection.title = section.title;
			newSection.description = section.description;

			newSection.save();
		}
	}
});

sectionSchema.post('save', function (section) { //sync all the sections inputs
	if(section.master) {
		var Section = mongoose.model('Section', sectionSchema);
		Section.findById(section.master).populate('inputs')
		.then(function(section) {
			section.inputs.forEach(function(input) {
				Input.findOne({clonedFrom: input._id, section: section._id})
				.then((clonedInput) => {
					clonedInput = clonedInput || new Input();
					if(clonedInput.syncWith(input)) {
						clonedInput.save();
					}
				});
			});
		});
	}
});

sectionSchema.post('save', function (section) {
	var Section = mongoose.model('Section', sectionSchema);
	if(section.children) {
		Section.find({_id: {$in: section.children } })
		.then(function(children) {
			children.forEach((child) => {
				if(child.syncWith(section)) {
					child.save();
				}
			});
		});
	}
});

sectionSchema.pre('remove', function (next) {
	var Section = mongoose.model('Section', sectionSchema);
	(
		this.master 
		? Section.update( {_id: this.master}, { $pullAll: {children: [this._id] } } )
		: Document.update( {_id: this.document}, { $pullAll: {sections: [this._id] } } )
	)
	.then(( (documents) => next() ))
	.error(( (err) => next(err) ));
});

sectionSchema.post('save', function (section) {
	var query = { position: section.position, _id: { $ne: section._id } };
	var Section = mongoose.model('Section', sectionSchema);
	query[(section.master ? 'master' : 'document')] = (section.master || section.document);
	

	Section.find(query)
	.then( function(sections) {
		return Promise.each(sections, function(section) {
			section.position++;
			return section.save();
		})
	})
	.error(( (err) => console.log(err) ));
});

sectionSchema.methods.syncWith = function(section) { 
	let self = this;
	var didChange = false;

	['title','description'].forEach((prop) => {
		if(self[prop] != section[prop]) {
			didChange = true;
			self[prop] = section[prop];
		}
	});

	return didChange;
}

export default mongoose.model('Section', sectionSchema);