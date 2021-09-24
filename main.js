//Interface utilisateur pour ajouter un autobus, supprimer un autobus, faire une recherche

import inquirer from 'inquirer';

import { currentAgencies, loadAgencyFromDatabase, writeAgencyToDatabase } from './database.js';
import { Agency, Bus } from './model.js';

const agencyChoices = [];
for (const agency of currentAgencies) {
    agencyChoices.push(agency.shortName);
}

const agency_select_questions = {
    name: 'agencyShortName',
    type: 'list',
    message: 'Veuillez choisir une agence (utilisez les flèches et la touche « retour » pour sélectionner):',
    choices: agencyChoices
};

const top_menu_questions = 
[
    {
        name: 'choice',
        type: 'list',
        message: 'Que voulez-vous faire? (utilisez les flèches et la touche « retour » pour sélectionner):',
        choices: ['Choisir une agence existante', 'Créer une nouvelle agence', 'Effacer une agence existante'],
    }
]

const agency_questions = [
    {
        name: 'actionChoice',
        type: 'list',
        message: 'Que voulez-vous faire? (utilisez les flèches et la touche « retour » pour sélectionner):',
        choices: ['Ajouter un autobus', 'Supprimer un autobus', 'Faire une recherche'],
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
        message: 'Quel est le nom court de l\'agence? (ex: stm)'
    }
];

const add_a_bus_questions = [
    {
        name: 'id',
        type: 'number',
        message: 'Quel est l\'identifiant de l\'autobus (sans espaces ni charactères spéciaux)?'
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
        message: 'Quel est le modèl de l\'autobus?'
    },
    {
        name: 'seatCount',
        type: 'nomber',
        message: 'Combien y a-t-il de places assises?'
    },
    {
        name: 'modelstandingCapacity',
        type: 'nombre',
        message: 'Combien y a-t-il de places debout?'
    },
    {
        name: 'doorCount',
        type: 'nombre',
        message: 'Combien y a-t-il de portes?'
    },
    {
        name: 'accessCount',
        type: 'nombre',
        message: 'Combien y a-t-il d\'accès?'
    },
];

var currentAgency = null;

inquirer.prompt(top_menu_questions).then(({ choice }) => {
    if (choice === 'Choisir une agence existante') {
        inquirer.prompt(agency_select_questions).then(({ agencyShortName }) => {
            currentAgency = loadAgencyFromDatabase(agencyShortName);
        });
    } else if (choice === 'Créer une nouvelle agence') {
        inquirer.prompt(add_an_agency_questions).then((answers) => {
            // The variable 'answers' will contain a value for answers.name and answers.shortName, which is
            // exactly what the constructor of Agency wants.
            currentAgency = new Agency(answers);
            writeAgencyToDatabase(currentAgency);
        });
    } else if (choice == 'Effacer une agence existante') {
        // TODO
    }
});

/*
inquirer.prompt(top_menu_questions) //doit changer les fonction flèches pour des fonctions.
    .then(({ actionChoice }) => {
        switch (actionChoice) {
            case 'Ajouter un autobus':
                return inquirer.prompt(add_a_bus_questions)
            case 'Supprimer un autobus':
                console.log('code pour supprimer');
                break;
            default:
                console.log('code pour recher à ajouter')
        }
    })

*/
//création d'une fonction qui permet l'ajout d'un bus dans la base de donnée busDB
const busDB = [];
const addBus = function (id, license, make, model, seatCount, standingCount, doorCount, accessCount) {
    const bus = {
        id: id,
        license: license,
        make: make,
        model: model,
        seatCount: seatCount,
        standingCount: standingCount,
        doorCount: doorCount,
        accessCount: accessCount
    };
    busDB.push(bus);
    return bus;
};

// création d'une fonction qui permet l'ajout d'une agence dans la base de donnée agencyDB

const agencyDB = [];
const addAgency = function (name, shortName, busInventory) {
    const agency = {
        name: name,
        shortName: shortName,
        busInventory: busInventory
    };
    agencyDB.push(agency);
    return agency;
};

