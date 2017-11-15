import mongoose from 'mongoose';

let notebookSchema = new mongoose.Schema({
  parts: [{type: mongoose.Schema.Types.ObjectId, ref:'Part'}]
});

export default mongoose.model('Notebook', notebookSchema);