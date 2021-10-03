//Interface utilisateur pour ajouter un autobus, supprimer un autobus, faire une recherche

import inquirer from 'inquirer';

import { currentAgencies, loadAgencyFromDatabase, writeAgencyToDatabase } from './database.js';
import { Agency, Bus } from './model.js';

const agency_questions = [
    {
        name: 'choice',
        type: 'list',
        message: 'Que voulez-vous faire? (utilisez les flèches et la touche « retour » pour sélectionner):',
        choices: ['Ajouter un autobus', 'Supprimer un autobus', 'Modifier un autobus', 'Montrer l\'inventaire d\'autobus', 'Faire une recherche', 'Quitter l\'application'],
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
        message: 'Quel est le numéro l\'identifiant de l\'autobus (nombre, sans espaces ni charactères spéciaux)?'
    },
    {
        name: 'license',
        type: 'input',
        message: 'Quel est le numéro de plaque d\'immatriculation de l\'autobus (La lettre A suivi d\'un nombre, sans espaces ni charactères spéciaux)?'
    },
    {
        name: 'make',
        type: 'input',
        message: 'Quel est le fabriquant de l\'autobus (doit contenir au moins une lettre)?'
    },
    {
        name: 'model',
        type: 'input',
        message: 'Quel est le modèle de l\'autobus?'
    },
    {
        name: 'seatCount',
        type: 'number',
        message: 'Combien y a-t-il de places assises (nombre) ?'
    },
    {
        name: 'standingCapacity',
        type: 'number',
        message: 'Combien y a-t-il de places debout (nombre) ?'
    },
    {
        name: 'doorCount',
        type: 'number',
        message: 'Combien y a-t-il de portes?'
    },
    {
        name: 'accessCount',
        type: 'number',
        message: 'Combien y a-t-il d\'accès (il ne devrait pas y avoir plus d\'accès que de portes)?'
    },
];

const searchBy_bus_question = [
    {
        name : 'choice',
        type : 'list',
        message:'Chercher l\'information de l\'autobus par :',
        choices : ['numéro d\'identifiant', 'numéro de plaque d\'immatriculation']
    }
];

var currentAgency = null;

function ask_agency_questions() {
    inquirer.prompt(agency_questions).then(({ choice }) => {
        if (choice === 'Ajouter un autobus') {
            ask_add_a_bus_questions();
        } else if (choice === 'Supprimer un autobus') {
            ask_delete_a_bus_questions();
        } else if (choice === 'Modifier un autobus') {
            const busChoices = generate_list_of_bus_choices();

            inquirer.prompt({
                name: 'bus_id',
                type: 'list',
                message: 'Veuillez choisir l\'autobus à modifier:',
                choices: busChoices
            }).then(({ bus_id }) => {
                ask_modify_a_bus_questions(bus_id);
            });
        } else if (choice == 'Faire une recherche') {
            ask_searchBy_bus_question();
        } else if (choice === 'Montrer l\'inventaire d\'autobus') {
            show_busInvetory();
        } else if (choice == 'Quitter l\'application') {
            process.exit()
        }
    });
}

function generate_list_of_bus_choices() {
    const busChoices = [];
    
    for (const bus of currentAgency.busInventory) {
        busChoices.push({'name': `Bus #${bus.id}: ${bus.license}, ${bus.make} ${bus.model}`, 'value': bus.id});
    }

    return busChoices;
}

function show_busInvetory(sortBy = 'id') {
    const inventory = currentAgency.busInventory.slice();
    inventory.sort(function(a, b) {
        return a[sortBy].toString().localeCompare(b[sortBy])
    });

    for (const bus of inventory) {
        console.log(`Bus #${bus.id}`);
        console.log(`Numéro d'immatriculation #${bus.license}`);
        console.log(`${bus.make}`);
        console.log(`Modèle ${bus.model}`);
        console.log(`${bus.seatCount} places assises`);
        console.log(`${bus.standingCapacity} places debout`);
        console.log(`${bus.doorCount} portes`);
        console.log(`${bus.accessCount} voies d'accès`);
        console.log('');
    }

    inquirer.prompt([
        {
            name: 'choice',
            type: 'list',
            loop: false,
            message: 'Que voulez-vous faire?',
            choices: [
                {'name': `Trier par numéro d'identification`, 'value': 'id'},
                {'name': `Trier par numéro d'immatriculation`, 'value': 'license'},
                {'name': `Trier par fabriquant`, 'value': 'make'},
                {'name': `Trier par modèle`, 'value': 'model'},
                {'name': `Trier par nombre de places assises`, 'value': 'seatCount'},
                {'name': `Trier par nombre de places debout`, 'value': 'standingCapacity'},
                {'name': `Trier par nombre de portes`, 'value': 'doorCount'},
                {'name': `Trier par nombre de voies d'accès`, 'value': 'accessCount'},
                {'name': `Retourner au menu principal`, 'value': 'mainMenu'}
            ],
        }
    ]).then(({ choice }) => {
        if (choice === 'mainMenu') {
            ask_top_menu_questions();
        } else {
            show_busInvetory(choice);
        }
    });
}

function ask_add_a_bus_questions() {
    inquirer.prompt(add_a_bus_questions).then((choices) => {
        if(
            (isNaN(choices.id) === false) && 
            ((choices.license.substring(0,1) === 'A' || choices.license.substring(0,1) === 'a') ===true ) && 
            (isNaN(choices.license.substring(1)) === false) &&
            (isNaN(choices.make) === true) &&
            (isNaN(choices.seatCount) === false) && 
            (isNaN(choices.standingCapacity) === false) && 
            (choices.seatCount + choices.standingCapacity < 210) && // où un bus articulé peut avoir plus de 190 personnes
            (choices.doorCount < 8) && //Ex. le rare bus MAN articulé version longue
            ((choices.accessCount > choices.doorCount) === false)
        )
            {const newBus = new Bus(choices);
            currentAgency.addBusToInventory(newBus);
            writeAgencyToDatabase(currentAgency);
            console.log("L'autobus a été ajoutée");
            ask_top_menu_questions();}
        else 
            {console.log('Le format des données ne respecte pas les consignes, veuillez entrez les informations à nouveau');
            ask_add_a_bus_questions();}
    });
}



function ask_delete_a_bus_questions() {
    busChoices = generate_list_of_bus_choices();
    inquirer.prompt({
        name: 'bus_id',
        type: 'list',
        message: 'Veuillez choisir l\'autobus à supprimer:',
        choices: busChoices
    }).then(({ bus_id }) => {
        const busObject = currentAgency.getBusById(bus_id);
        currentAgency.removeBusFromInventory(busObject);
        writeAgencyToDatabase(currentAgency);
        console.log("Le bus a été supprimé.\n");
        ask_agency_questions();
    });
}

function ask_modify_a_bus_questions(bus_id) {
    const bus = currentAgency.getBusById(bus_id);

    const modify_a_bus_questions = [
        {
            name: 'attribute',
            type: 'list',
            loop: false,
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

// fonction ask_searchBy_bus_question() pour demander par quelle information l'usager souhaite chercher le bus en format async function partie 1/2
const ask_searchBy_bus_question = async function()  {
    const choice = await inquirer.prompt(searchBy_bus_question)
        .then(({choice}) => { //comment faire le .then sans la flèche si on n'a pas de fonction à mettre?
            if (choice ==='numéro d\'identifiant') {
             ask_searchBy_bus_id();
            }
            else {ask_searchBy_bus_license();
            }
        } ) 
}
//chercher un bus par identifiant partie 2/2 A:
const ask_searchBy_bus_id = async function(){
    const searchedId = await inquirer.prompt({name :'searchedId', message : 'Entrez le numéro d\'identifiant', type : 'number'})
        .then(({searchedId}) => {
            let searchResult = currentAgency.busInventory.filter((autobus) => autobus.id === searchedId);
            console.log(searchResult)
            ask_top_menu_questions();
            } )}

//chercher un bus par plaque d'immatriculation partie 2/2 B:
const ask_searchBy_bus_license = async function (){
    const searchedLiscence = await inquirer.prompt({name :'searchedLicense', message : 'Entrez la plaque d\'immatriculation', type : 'input'})
        .then(({searchedLicense}) => {
            let searchResult = currentAgency.busInventory.filter((autobus) => autobus.license === searchedLicense);
            console.log(searchResult)
            ask_top_menu_questions();
            } )}

function ask_top_menu_questions() {
    const choices = ['Créer une nouvelle agence'];
    if (currentAgencies.length > 0) {
        // Only display this choice if there are agencies to be loaded.
        choices.push('Choisir une agence existante');
    }
    choices.push('Quitter l\'application');

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
                for (const agency of currentAgencies) {
                    // We use .toUpperCase() to do a case-insensitive comparison.
                    if (agency.shortName.toUpperCase() === answers.shortName.toUpperCase()) {
                        // This agency already exists!
                        console.log("Cette agence existe déjà.");
                        return;
                    }
                }
                // The variable 'answers' will contain a value for answers.name and answers.shortName, which is
                // exactly what the constructor of Agency wants.
                currentAgency = new Agency(answers);
                writeAgencyToDatabase(currentAgency);

                ask_agency_questions();
            });
        } else if (choice == 'Effacer une agence existante') {
            inquirer.prompt()
        } else if (choice === 'Quitter l\'application') {
            process.exit()
        }
    });
}

ask_top_menu_questions();
