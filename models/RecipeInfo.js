import mongoose from "mongoose";

const Schema=mongoose.Schema;

const RecipeInfo=new Schema({
    RecipeName:{type:String, require:true},
    Category:{type:String,require:true},
    Imageurl:{type:String, require:true},
    Ingredients:{type:String,require:true},
    Instructions:{type:String,require:true},
    UserID:{type:String, require:true},
})

const AddRecipe=mongoose.model('RecipeInfo',RecipeInfo);
export {AddRecipe};