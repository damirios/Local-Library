const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const {Schema} = mongoose;

const AuthorSchema = new Schema({
    first_name: {type: String, required: true, maxLength: 100},
    family_name: {type: String, required: true, maxLength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date}
});

// Virtual for author's full name
AuthorSchema.virtual('name').get(function() {
// To avoid errors in cases where an author does not have either a family name or first name
// We want to make sure we handle the exception by returning an empty string for that case
    let fullname = "";
    if (this.first_name && this.family_name) {
        fullname = `${this.first_name}, ${this.family_name}`;
    } else {
        fullname = '';
    }
    return fullname;
});

// Virtual property for formatted dates
AuthorSchema.virtual("lifetime_formatted").get(function() {
    let lifetime = 'unknown';
    if (this.date_of_birth) {
        lifetime = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
        if (this.date_of_death) {
            lifetime += ' - ' + DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED);
        } else {
            lifetime += ' - ' + 'still lives';
        }
    }
    
    return lifetime;
});

// Virtual for author's URL
AuthorSchema.virtual('url').get(function() {
// We don't use an arrow function as we'll need the this object
    return `/catalog/author/${this._id}`;
});

// Export model 
module.exports = mongoose.model('Author', AuthorSchema);