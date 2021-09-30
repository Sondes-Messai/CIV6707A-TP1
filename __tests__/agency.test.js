import { Bus, Agency } from '../model.js';

function createFakeBus() {
  return new Bus({
    id: 432,
    license: 20219,
    make: 'NovaBus',
    model: 'LFSe',
    seatCount: 46,
    standingCapacity: 30,
    doorCount: 2,
    accessCount: 2
  });
}

function createFakeAgency() {
  return new Agency({
    name: "Société de Transport de Test",
    shortName: "stt",
    busInventory: []
  });
}

test('verifies Agency.addBusToInventory', () => {
  const fakeAgency = createFakeAgency();

  // Create two fake buses that have different IDs.
  const fakeBus = createFakeBus();
  const fakeBus2 = createFakeBus();
  fakeBus2.id = 200;

  // Add two buses to the inventory
  fakeAgency.addBusToInventory(fakeBus);
  fakeAgency.addBusToInventory(fakeBus2);

  // Expect two buses in the inventory
  expect(fakeAgency.busInventory.length).toEqual(2);

  // We shouldn't be able to add a bus that is already in the inventory.
  expect(() => {
    fakeAgency.addBusToInventory(fakeBus)
  }).toThrow();
});

test('verifies Agency.removeBusFromInventory', () => {
  const fakeAgency = createFakeAgency();
  const fakeBus = createFakeBus();

  // We should not be able to remove a bus that isn't in the inventory.
  expect(() => {
    fakeAgency.removeBusFromInventory(fakeBus)
  }).toThrow();

  fakeAgency.addBusToInventory(fakeBus);
  fakeAgency.removeBusFromInventory(fakeBus);

  // There should not be any buses left in the inventory.
  expect(fakeAgency.busInventory.length).toEqual(0);
});

test('verifies Agency.getBusById', () => {
  const fakeAgency = createFakeAgency();

  // Create two fake buses that have different IDs.
  const fakeBus = createFakeBus();
  const fakeBus2 = createFakeBus();
  fakeBus2.id = 200;

  // Add two buses to the inventory.
  fakeAgency.addBusToInventory(fakeBus);
  fakeAgency.addBusToInventory(fakeBus2);

  expect(fakeAgency.getBusById(fakeBus.id)).toEqual(fakeBus);
});

test('verifies Agency.getBusById == Agency.getBusByLicense', () => {
  const fakeAgency = createFakeAgency();

  // Create two a fake bus. We should be able to find this bus
  // either by ID or by license.
  const fakeBus = createFakeBus();

  fakeAgency.addBusToInventory(fakeBus);

  expect(fakeAgency.getBusById(fakeBus.id)).toEqual(fakeAgency.getBusByLicense(fakeBus.license));
});
