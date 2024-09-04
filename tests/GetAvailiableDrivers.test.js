const { filterAvailableDrivers } = require('../utils/GetAvailiableDrivers');

describe('filterAvailableDrivers', () => {
    it('should return available drivers for a given date and time range', () => {
        const drivers = [
            {
                name: 'Driver1',
                offDays: ['Monday'],
                specificOffDates: ['2024-09-09'],
                workingTime: '08:00-16:00'
            },
            {
                name: 'Driver2',
                offDays: [],
                specificOffDates: [],
                workingTime: '09:00-17:00'
            }
        ];

        const desiredDate = '2024-09-10'; // Tuesday
        const desiredTimeRange = '10:00-12:00';

        const result = filterAvailableDrivers(drivers, desiredDate, desiredTimeRange);

        expect(result).toEqual(['Driver1', 'Driver2']);
    });

    it('should return an empty array if no drivers are available', () => {
        const drivers = [
            {
                name: 'Driver1',
                offDays: ['Monday', 'Tuesday'],
                specificOffDates: ['2024-09-10'],
                workingTime: '08:00-16:00'
            }
        ];

        const desiredDate = '2024-09-10'; // Tuesday
        const desiredTimeRange = '10:00-12:00';

        const result = filterAvailableDrivers(drivers, desiredDate, desiredTimeRange);

        expect(result).toEqual([]);
    });
});
