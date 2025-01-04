import mongoose from "mongoose";

const Schema=mongoose.Schema;

const RecipeInfo=new Schema({
    RecipeName:{type:String, require:true},
    RecipeCategory:{type:String,require:true},
    RecipeImage:{type:String, require:true},
    RecipeIngredient:{type:String,require:true},
    RecipeInstructions:{type:String,require:true},
    UserID:{type:String, require:true},
})

const AddRecipe=mongoose.model('RecipeInfo',RecipeInfo);
export {AddRecipe};