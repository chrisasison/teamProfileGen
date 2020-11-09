const inquirer = require("inquirer");
const fs = require("fs");
const validator = require('validator');

const Developer = require("./model/developer");
const Manager = require("./model/manager");

const util = require("util");
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const appendFileAsync = util.promisify(fs.appendFile);

console.log("Create your DEV team...");


let HTMLString = "";
const teamArray = [];


async function mainQuestions() {
try {
    const employeeQuestions = await inquirer.prompt([
        {
            message:"Please enter the employee's name",
            name: "name",
            validate: async (input) => {
                if (input === "") {
                    return "Please input a name"
                }
                return true;
            }
        },
        {
            message:"Please enter the employee's ID",
            name: "id",
            trim: true,
            minlength: 7,
            validate: async (input) => {
                if (isNaN(input)) {
                    return "You must input a number"
                }
                return true;
            }
        },
        {
            message:"Please enter the employee's email",
            name: "email",
            minlength: 7,
            trim: true,
            toLowerCase: true,
            validate: async (input) => {
                if (!validator.isEmail(input)) {
                    throw new eor('Please enter a valid email address.');
                }
                return true;
            }
        },
        {
            type:"list",
            message:"Which of the following roles best describes this employee?",
            choices:["Developer", "Manager"],
            name:"role"
        }
    ]);
    let newEmployee;

    if (employeeQuestions.role === "Developer") {
        await inquirer.prompt(
            {
                message:"What is this Developer's GitHub username?",
                name:"github"
            }
        ).then(response => {
            newEmployee = new Developer(employeeQuestions.name, employeeQuestions.id, employeeQuestions.email, response.github);
        });
    } else {
        await inquirer.prompt(
            {
                message:"What is the manager's office number?",
                name:"officeNumber"
            }
        ).then(response => {
            newEmployee = new Manager(employeeQuestions.name, employeeQuestions.id,employeeQuestions.email,response.officeNumber);
        })
    }

    teamArray.push(newEmployee);

    const addMore = await inquirer.prompt(
        {
            type:"list",
            message:"Would you like to add another team member?",
            choices:["Yes","No"],
            name:"addMore"
        }
    );


    if (addMore.addMore === "Yes") {
        console.log("==================");
        mainQuestions();
    }
    else {
        createHTML();
    }
}
catch (e) {
    console.log(e);
}
}


const createCard = (role,name,id,email) => {

    fs.readFile(`./components/${role.toLowerCase()}.html`, "utf8", function(e, card){
        if (e) throw e;
        card = card.replace("name", name);
        card = card.replace("role", role);
        card = card.replace("ID", `ID: ${id}`);
        card = card.replace("Email", `Email: ${email}`);
        fs.appendFile("./output/team.html", card, function(e){
        if (e) throw e;
    });
    });
};


async function createHTML() {
    try {

    let indexHTML = fs.readFileSync("./components/index.html")

    fs.writeFileSync("./output/team.html",indexHTML,function(e){
    if (e) throw e;
    });

    teamArray.forEach(member => {
        if(member.getRole() === "Developer") {
            createCard(member.getRole(),member.getName(),member.getId(),member.getEmail(),`GitHub Username: ${member.getGithub()}`);
        } else {
            createCard(member.getRole(),member.getName(),member.getId(),member.getEmail(),`Office Number: ${member.getOfficeNumber()}`);
        }
    });
    }
    catch (e) {
        console.log(e)
    }
}

mainQuestions();
