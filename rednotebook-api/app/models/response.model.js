import mongoose from 'mongoose';
import User from './user.model';
import Input from './input.model';
import crypto from 'crypto';

let responseSchema = new mongoose.Schema({
	value: { type: String },
	user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	input: {type: mongoose.Schema.Types.ObjectId, ref: 'Input'},
	isEncrypted: {
		type: Boolean,
		required: true,
		default: false
	},
});

responseSchema.virtual('encryptionKey').get(function() {
  return this._encryptionKey;
});

responseSchema.virtual('encryptionKey').set(function(encryptionKey) {
  return this._encryptionKey = encryptionKey;
});

responseSchema.virtual('decryptedValue').get(function() {
	var encryptionKey = this._encryptionKey;
	if(!this.isEncrypted || !encryptionKey) {
		return this.value;
	}

	var algorithm = 'aes-256-ctr';
	var decipher = crypto.createDecipher(algorithm, (encryptionKey));
	
  var dec = decipher.update(this.value,'hex','utf8');
  dec += decipher.final('utf8');

  return dec;
});

responseSchema.set('toObject', {
  getters: true,
  virtuals: true
});

responseSchema.set('toJSON', {
  getters: true,
  virtuals: true
});

responseSchema.pre('save', function (next) {
	var self = this;

	Input.findById(self.input)
	.then(function(input) {
		if(input.requiresEncryption) { 
			var algorithm = 'aes-256-ctr';
			var cipher = crypto.createCipher(algorithm, self._encryptionKey);
			var crypted = cipher.update(self.value,'utf8','hex')
			
			crypted += cipher.final('hex');
			self.isEncrypted = true;
			self.value = crypted;
		}
		next();
	})
});

responseSchema.pre('save', function (next) {
	Input.update( {_id: this.input}, { $addToSet: {responses: this._id } } )
	.then(( (inputs) => next() ))
	.error(( (err) => next(err) ));
});

responseSchema.pre('save', function (next) {
	User.update( {_id: this.user}, { $addToSet: {responses: this._id } } )
	.then(( (users) => next() ))
	.error(( (err) => next(err) ));
});

responseSchema.pre('remove', function (next) {
	Input.update( {_id: this.input}, { $pullAll: {responses: [this._id] } } )
	.then(( (inputs) => next() ))
	.error(( (err) => next(err) ));
});

responseSchema.pre('remove', function (next) {
	User.update( {_id: this.user}, { $pullAll: {responses: [this._id] } } )
	.then(( (users) => next() ))
	.error(( (err) => next(err) ));
});

export default mongoose.model('Response', responseSchema);