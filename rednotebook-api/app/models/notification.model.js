import mongoose from 'mongoose';
import User from './user.model';
import nodemailer from 'nodemailer';


let notificationSchema = new mongoose.Schema({
	seenAt: { type: Date },
	openedAt: { type: Date },
	user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	message: String,
	data: Object
}, {
  timestamps: true
});

notificationSchema.methods.url = function() {
	return `https://rednotebookproject.com/documents/${this.data.id}`;
}

notificationSchema.methods.sendEmail = function() {
	var self = this;
	var smtpConfig = {
		host: 'smtp.gmail.com',
		port: 465,
		secure: true, // use SSL
    auth: {
	    user: 'cody.swann@gmail.com',
	    pass: '*****'
    }
	};

	var transporter = nodemailer.createTransport(smtpConfig);

	return User.findById(self.user)
	.then(function(user) {
		return transporter.sendMail({
		  from: 'no-reply@rednotebookproject.com',
		  to: user.email,
		  subject: "New Message from your Red Notebook",
		  text: `${self.message}\n\n${self.url()}`
		});
	})
};

notificationSchema.pre('save', function (next) {
	User.update( {_id: this.user}, { $addToSet: {notifications: this._id } } )
	.then(( (users) => next() ))
	.error(( (err) => next(err) ));
});

notificationSchema.post('save', function (notification) {
	// notification.sendEmail()
	// .then(function() {
	// 	console.log(arguments);
	// })
	// .catch(function() {
	// 	console.log(arguments);
	// })
	// ;
});

export default mongoose.model('Notification', notificationSchema);