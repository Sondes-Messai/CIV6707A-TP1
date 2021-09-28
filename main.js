//Interface utilisateur pour ajouter un autobus, supprimer un autobus, faire une recherche

import inquirer from 'inquirer';

import { currentAgencies, loadAgencyFromDatabase, writeAgencyToDatabase } from './database.js';
import { Agency, Bus } from './model.js';

const top_menu_questions = 
[
    {
        name: 'choice',
        type: 'list',
        message: 'Que voulez-vous faire? (utilisez les flèches et la touche « retour » pour sélectionner):',
        choices: ['Choisir une agence existante', 'Créer une nouvelle agence', 'Effacer une agence existante'],
    }
];

const agency_questions = [
    {
        name: 'choice',
        type: 'list',
        message: 'Que voulez-vous faire? (utilisez les flèches et la touche « retour » pour sélectionner):',
        choices: ['Ajouter un autobus', 'Supprimer un autobus', 'Modifier un autobus', 'Faire une recherche'],
    }
];

const add_an_agency_questions = [
    {
        name: 'name',
        type: 'input',
        message: 'Quel est le nom complet de l\'agence?'
    },
    {
        name: 'shortName',
        type: 'input',
        message: 'Quel est l\'abbréviation du nom de l\'agence? (ex: stm)'
    }
];

const add_a_bus_questions = [
    {
        name: 'id',
        type: 'number',
        message: 'Quel est le numéro l\'identifiant de l\'autobus (sans espaces ni charactères spéciaux)?'
    },
    {
        name: 'license',
        type: 'input',
        message: 'Quel est le numéro de plaque d\'immatriculation de l\'autobus (sans espaces ni charactères spéciaux)?'
    },
    {
        name: 'make',
        type: 'input',
        message: 'Quel est le fabriquant de l\'autobus?'
    },
    {
        name: 'model',
        type: 'input',
        message: 'Quel est le modèle de l\'autobus?'
    },
    {
        name: 'seatCount',
        type: 'number',
        message: 'Combien y a-t-il de places assises?'
    },
    {
        name: 'standingCapacity',
        type: 'number',
        message: 'Combien y a-t-il de places debout?'
    },
    {
        name: 'doorCount',
        type: 'number',
        message: 'Combien y a-t-il de portes?'
    },
    {
        name: 'accessCount',
        type: 'number',
        message: 'Combien y a-t-il d\'accès?'
    },
];

const searchBy_bus_question = [
    {
        name : 'searchBy_choice', // ou appeler slmt choice?
        type : 'list',
        message:'Chercher l\'information de l\'autobus par :',
        choices : ['numéro d\'identifiant', 'numéro de plaque d\'immatriculation', 'fabriquant', 'moodèle', 'nombre de places assises', 'nombre de places debout', 'nombre de porte', 'nombre d\'accès']
    }
];
const deleteBy_bus_question = [
    {
        name : 'deleteBy_choice', // ou appeler slmt choice?
        type : 'list',
        message:'Supprimer un ou des autobus par :',
        choices : ['numéro d\'identifiant', 'numéro de plaque d\'immatriculation', 'fabriquant', 'moodèle', 'nombre de places assises', 'nombre de places debout', 'nombre de porte', 'nombre d\'accès']
    }
    
];

var currentAgency = null;

function ask_agency_questions() {
    inquirer.prompt(agency_questions).then(({ choice }) => {
        if (choice === 'Ajouter un autobus') {
            ask_add_a_bus_questions();
        } else if (choice === 'Supprimer un autobus') {
            ask_deleteBy_bus_questions();
        } else if (choice === 'Modifier un autobus') {
            const busChoices = [];
            for (const bus of currentAgency.busInventory) {
                busChoices.push({'name': `Bus #${bus.id}: ${bus.license}, ${bus.make} ${bus.model}`, 'value': bus.id});
            }

            inquirer.prompt({
                name: 'bus_id',
                type: 'list',
                message: 'Veuillez choisir l\'autobus à modifier:',
                choices: busChoices
            }).then(({ bus_id }) => {
                ask_modify_a_bus_questions(bus_id);
            });
        } else if (choice == 'Faire une recherche') {
            ask_searchBy_bus_questions();
        }
    });
}

function ask_add_a_bus_questions() {
    inquirer.prompt(add_a_bus_questions).then((choices) => {
        const newBus = new Bus(choices);
        currentAgency.addBusToInventory(newBus);
        writeAgencyToDatabase(currentAgency);
    });
}

function ask_modify_a_bus_questions(bus_id) {
    const bus = currentAgency.getBusById(bus_id);

    const modify_a_bus_questions = [
        {
            name: 'attribute',
            type: 'list',
            message: 'Quel attribut voulez-vous modifier?',
            choices: [
                {'name': `Numéro d\'identification (${bus.id})`, 'value': 'id'},
                {'name': `Numéro d\'immatriculation (${bus.license})`, 'value': 'license'},
                {'name': `Fabriquant (${bus.make})`, 'value': 'make'},
                {'name': `Modèle (${bus.model})`, 'value': 'model'},
                {'name': `Nombre de places assises (${bus.seatCount})`, 'value': 'seatCount'},
                {'name': `Nombre de places debout (${bus.standingCount})`, 'value': 'standingCapacity'},
                {'name': `Nombre de portes (${bus.doorCount})`, 'value': 'doorCount'},
                {'name': `Nombres de voies d'accès (${bus.accessCount})`, 'value': 'accessCount'}
            ]
        }
    ];


    inquirer.prompt(modify_a_bus_questions).then(({ attribute }) => {
        inquirer.prompt({'message': "Quelle est la nouvelle valeur?", 'name': 'new_value'}).then(({ new_value }) => {
            bus[attribute] = new_value;
            writeAgencyToDatabase(currentAgency);
            console.log("La modification a été enregistrée.\n");
            ask_top_menu_questions();
        });
    });
}
//fonction ask_searchBy_bus_questions() incomplète. La 2e question ne se déclenche pas.
function ask_searchBy_bus_questions() {
    inquirer.prompt(searchBy_bus_question).then(({searchBy_choice})=>{
       
        if (searchBy_choice ==='numéro d\'identifiant') {
            inquirer.prompt({name :'searchId',message : 'Entrez le numéro d\'identifiant', type : 'number'})
            let searchResults = [];
            searchResults = currentAgency.filter((searchResults)=>currentAgency.id === searchId);
            console.log(searchResults);
            }
        else if (searchBy_choice ==='numéro de plaque d\'immatriculation') {
            inquirer.prompt({name :'searchLicense',message : 'Entrez le numéro de plaque d\'immatriculation', type : 'input'})
            let searchResults = [];
            searchResults = currentAgency.filter((searchResults)=>currentAgency.license === 'searchLicense');
            console.log(searchResults);    
            }
        else if (searchBy_choice ==='fabriquant') {
            inquirer.prompt({name :'searchMake',message : 'Entrez le nom du fabriquant', type : 'input'})
            let searchResults = [];
            searchResults = currentAgency.filter((searchResults)=>currentAgency.make === 'searchMake');
            console.log(searchResults);    
            }
        else if (searchBy_choice ==='modèle') {
            inquirer.prompt({name :'searchModel',message : 'Entrez le nom du modèle', type : 'input'})
            let searchResults = [];
            searchResults = currentAgency.filter((searchResults)=>currentAgency.model === 'searchModel');
            console.log(searchResults);  
            }
        else if (searchBy_choice ==='nombre de places assises') {
            inquirer.prompt({name :'searchSeatCount',message : 'Entrez le nombre de places assises', type : 'number'})
            let searchResults = [];
            searchResults = currentAgency.filter((searchResults)=>currentAgency.seatCount === 'searchSeatCount');
            console.log(searchResults);  
            }
        else if (searchBy_choice ==='nombre de place debout') {
            inquirer.prompt({name :'searchStandingCount',message : 'Entrez le nombre de places debout', type : 'number'})
            let searchResults = [];
            searchResults = currentAgency.filter((searchResults)=>currentAgency.standingCount === 'searchStandingCount');
            console.log(searchResults);          
            }     
        else if (searchBy_choice ==='nombre de porte') {
            inquirer.prompt({name :'searchDoorCount',message : 'Entrez le nombre de porte', type : 'number'})
            let searchResults = [];
            searchResults = currentAgency.filter((searchResults)=>currentAgency.doorCount === 'searchDoorCount');
            console.log(searchResults);          
            }    
        else if (searchBy_choice ==='nombre d\'accès') {
            inquirer.prompt({name :'searchAccesCount',message : 'Entrez le nombre d\'accès', type : 'number'})
            let searchResults = [];
            searchResults = currentAgency.filter((searchResults)=>currentAgency.accessCount === 'searchAccessCount');
            console.log(searchResults);          
                }         
         })
        };*/
//fonction ask_deleteBy_bus_questions() incomplète. La 2e question ne se déclenche pas.
function ask_deleteBy_bus_questions()    {
    inquirer.prompt(deleteBy_bus_question).then(({deleteBy_choice})=>{
        if (deleteBy_choice ==='numéro d\'identifiant') {
            inquirer.prompt({name :'deleteId', message : 'Entrez le numéro d\'identifiant', type : 'number'})
            let searchResults =  [];
            for( let i = 0; i < currentAgency.length; i++){ 
                if (currentAngency.length[i].id === deleteId) {
                   // searchResults.push()
                    return searchResults}}
                    inquirer.prompt({name:'verification',message : 'Voici le ou les autobus qui seront supprimés, veuillez confirmer (Y : supprimer, N : annuler la supression) ', type : 'confirm'})
                    if (verification = true){
                        currentAgency.splice(i);
                        i--;
                    }
        else if (deleteBy_choice === 'numéro de plaque d\'immatriculation' && deleteBy_choice ==='verification') {
            console.log ('todo à compléter si fonctionne')}
                }}
    )};    
           

function ask_top_menu_questions() {
    const choices = ['Créer une nouvelle agence'];
    if (currentAgencies.length > 0) {
        // Only display these choices if there are agencies to be loaded or deleted.
        choices.push('Choisir une agence existante');
        choices.push('Effacer une agence existante');
    }

    const top_menu_questions = {
            name: 'choice',
            type: 'list',
            message: 'Que voulez-vous faire? (utilisez les flèches et la touche « retour » pour sélectionner):',
            choices: choices,
    };

    inquirer.prompt(top_menu_questions).then(({ choice }) => {
        if (choice === 'Choisir une agence existante') {
            const agencyChoices = [];
            for (const agency of currentAgencies) {
                agencyChoices.push(agency.shortName);
            }

            inquirer.prompt({
                name: 'agencyShortName',
                type: 'list',
                message: 'Veuillez choisir une agence (utilisez les flèches et la touche « retour » pour sélectionner):',
                choices: agencyChoices
            }).then(({ agencyShortName }) => {
                currentAgency = loadAgencyFromDatabase(agencyShortName);
                ask_agency_questions();
            });
        } else if (choice === 'Créer une nouvelle agence') {
            inquirer.prompt(add_an_agency_questions).then((answers) => {
                // The variable 'answers' will contain a value for answers.name and answers.shortName, which is
                // exactly what the constructor of Agency wants.
                currentAgency = new Agency(answers);
                writeAgencyToDatabase(currentAgency);

                ask_agency_questions();
            });
        } else if (choice == 'Effacer une agence existante') {
            inquirer.prompt()
        }
    });
}

ask_top_menu_questions();
