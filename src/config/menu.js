
const menu = {
  hobbies: [
    {
      id: '1',
      name: 'Basketball',
      options: ['hobby'],
    },
    {
      id: '2',
      name: 'Football',
      options: ['hobby'],
    },
    {
      id: '3',
      name: 'Movies',
      options: ['hobby'],
    },
    {
      id: '4',
      name: 'Music',
      options: ['hobby'],
    },
    {
      id: '5',
      name: 'Sleep',
      options: ['hobby'],
    },

  ],
  items: [
    {
      id: '1',
      name: 'Monday',
      options: ['day'],
    },
    {
      id: '2',
      name: 'Tuesday',
      options: ['day'],
    },
    {
      id: '3',
      name: 'Wednesday',
      options: ['day'],
    },
    {
      id: '4',
      name: 'Thursday',
      options: ['day'],
    },
    {
      id: '5',
      name: 'Friday',
      options: ['day'],
    },
    {
      id: '6',
      name: 'Saturday',
      options: ['day'],
    },
    {
      id: '7',
      name: 'Sunday',
      options: ['day'],
    },

  ],
  options: [
    {
      id: 'day',
      choices: [
        // this.listOfHours()
      ],
    },
  ],

  listOfTypes() {
    return menu.items.map(i => ({ text: i.name, value: i.id }));
  },
  listOfHours() {
    let hours = [];
    let initial = 12;
    let increment = 0;
    for (let i = 0; i < 14; i++) {
      let timeframe = {
        id: i,
        name: `${initial}:${increment == 0 ? '00' : increment}`
      };
      if (increment < 30) {
        increment += 30;
      } else {
        if (increment == 30) {
          increment = increment - 30;
          initial += 1;
        }
      }
      hours.push(timeframe);
    }
    return hours.map(i => ({ text: i.name, value: i.id, name: i.name }));
  },

};

module.exports = menu;
