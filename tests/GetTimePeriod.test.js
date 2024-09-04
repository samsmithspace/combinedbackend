const { getAvailableTimePeriods } = require('../utils/GetTimePeriod');

describe('getAvailableTimePeriods', () => {
    it('should return available time periods for a given date', () => {
        const drivers = [
            {
                offDays: ['Monday'],
                specificOffDates: ['2024-09-09'],
                workingTime: '08:00-16:00'
            },
            {
                offDays: [],
                specificOffDates: [],
                workingTime: '09:00-17:00'
            }
        ];

        const specificDate = '2024-09-10'; // Tuesday

        const result = getAvailableTimePeriods(drivers, specificDate);

        expect(result).toEqual(['08:00-17:00']);
    });

    it('should return an empty array if no drivers are available', () => {
        const drivers = [
            {
                offDays: ['Tuesday'],
                specificOffDates: ['2024-09-10'],
                workingTime: '08:00-16:00'
            }
        ];

        const specificDate = '2024-09-10'; // Tuesday

        const result = getAvailableTimePeriods(drivers, specificDate);

        expect(result).toEqual([]);
    });
});
