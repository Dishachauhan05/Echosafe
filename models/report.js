const {Schema,model} = require("mongoose");

const reportSchema = new Schema({
    description:{
        type:String,
        required:true,
    },
    ImageURL:{
        type:String,
    },
    voice:{
        type:String,
    },
    location:{
     type:{
        type:String,
        enum:['Point'],
        required:true,
    },
    coordinates:{
        type:[Number],
        required:true,
    }
}
},{timestamps:true});


const Report = model("report",reportSchema);

module.exports = Report;