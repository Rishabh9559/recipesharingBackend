import mongoose from "mongoose";

const Schema=mongoose.Schema;

const RecipeInfo=new Schema({
    RecipeName:{type:String, require:true},
    RecipeCategory:{type:String,require:true},
    RecipeImage:{type:ImageData, require:true},
    RecipeIngredient:{type:String,require:true},
    RecipeInstructions:{type:String,require:true},
})

module.exports=mongoose.model('RecipeInfo',RecipeInfo);
