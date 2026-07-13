function startSetup(){

document.getElementById("welcome")
.classList.add("hidden");


document.getElementById("setup")
.classList.remove("hidden");

}




function saveProfile(){


let name =
document.getElementById("userName").value;


let family =
document.getElementById("familyMembers").value;


let diet =
document.getElementById("diet").value;



localStorage.setItem(
"userName",
name
);


localStorage.setItem(
"family",
family
);


localStorage.setItem(
"diet",
diet
);



document.getElementById("setup")
.classList.add("hidden");



document.getElementById("dashboard")
.classList.remove("hidden");



document.getElementById("displayName")
.innerHTML=name;



}