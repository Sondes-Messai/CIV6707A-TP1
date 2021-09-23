//Interface utilisateur pour ajouter un autobus, supprimer un autobus, faire une recherche

import pkg from 'inquirer';
const { inquirer } = pkg;

import { currentAgencies } from './database.js';

const agencyChoices = [];
for (const agency of currentAgencies) {
    agencyChoices.push(`${agency.name} (${agency.shortName})`);
}

const agency_select_questions = {
    name: 'agencies',
    type: 'list',
    message: 'Veuillez choisir une agence (utilisez les flèches et la touche « retour » pour sélectionner):',
    choices: a
};

const top_menu_questions = 
[
    {
        name: 'actionChoice',
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

