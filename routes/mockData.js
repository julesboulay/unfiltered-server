let hongkong = [
  {
    google_place_id: "mockMachine_id_1",
    place_name: "mockMachine_name_1",
    lat: 22.275,
    lng: 114.16,
    address: "mockMachine_address_1"
  },
  {
    google_place_id: "mockMachine_id_2",
    place_name: "mockMachine_name_2",
    lat: 22.273,
    lng: 114.185,
    address: "mockMachine_address_2"
  },
  {
    google_place_id: "mockMachine_id_3",
    place_name: "mockMachine_name_3",
    lat: 22.274,
    lng: 114.204,
    address: "mockMachine_address_3"
  }
];

let sanfrancisco = [
  {
    google_place_id: "mockMachine_id_1",
    place_name: "mockMachine_name_1",
    lat: 37.77,
    lng: -122.42,
    address: "mockMachine_address_1"
  },
  {
    google_place_id: "mockMachine_id_2",
    place_name: "mockMachine_name_2",
    lat: 37.775,
    lng: -122.41,
    address: "mockMachine_address_2"
  },
  {
    google_place_id: "mockMachine_id_3",
    place_name: "mockMachine_name_3",
    lat: 37.765,
    lng: -122.43,
    address: "mockMachine_address_3"
  }
];

const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

const MockData = async (mock, sec) => {
  await sleep(sec * 1000);
  if (mock == 1) return hongkong;
  else return sanfrancisco;
};

module.exports = { MockData, hongkong, sanfrancisco };
