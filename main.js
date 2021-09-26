//Interface utilisateur pour ajouter un autobus, supprimer un autobus, faire une recherche

import inquirer from 'inquirer';

import { currentAgencies, loadAgencyFromDatabase, writeAgencyToDatabase } from './database.js';
import { Agency, Bus } from './model.js';

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

var currentAgency = null;

function ask_agency_questions() {
    inquirer.prompt(agency_questions).then(({ choice }) => {
        if (choice === 'Ajouter un autobus') {
            ask_add_a_bus_questions();
        } else if (choice === 'Supprimer un autobus') {
            console.log('todo: remove a bus');
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
            console.log('todo: search');
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
            // TODO
        }
    });
}

ask_top_menu_questions();
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

