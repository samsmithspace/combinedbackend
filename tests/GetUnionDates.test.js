const { getCombinedUnavailableDays } = require('../utils/GetUnionDates');

describe('getCombinedUnavailableDays', () => {
    it('should return combined unavailable days correctly', () => {
        const drivers = [
            {
                offDays: ['Monday', 'Wednesday'],
                specificOffDates: ['2024-09-09', '2024-09-11'] // These dates correspond to 'Monday' and 'Wednesday'
            },
            {
                offDays: ['Tuesday'],
                specificOffDates: ['2024-09-10'] // This date corresponds to 'Tuesday'
            }
        ];

        const result = getCombinedUnavailableDays(drivers);

        expect(result).toEqual({
            weekdaysOff: ['Monday', 'Wednesday', 'Tuesday'],
            specificDatesOff: [] // Specific dates should be empty as all fall on weekdays off
        });
    });

    it('should include specific dates that do not fall on any off days', () => {
        const drivers = [
            {
                offDays: ['Monday', 'Wednesday'],
                specificOffDates: ['2024-09-12', '2024-09-13'] // These dates correspond to 'Thursday' and 'Friday'
            },
            {
                offDays: ['Tuesday'],
                specificOffDates: ['2024-09-15'] // This date corresponds to 'Sunday'
            }
        ];

        const result = getCombinedUnavailableDays(drivers);

        expect(result).toEqual({
            weekdaysOff: ['Monday', 'Wednesday', 'Tuesday'],
            specificDatesOff: ['2024-09-12', '2024-09-13', '2024-09-15'] // These are valid as they don't fall on off days
        });
    });

    it('should return an empty array if no drivers are provided', () => {
        const drivers = [];

        const result = getCombinedUnavailableDays(drivers);

        expect(result).toEqual({
            weekdaysOff: [],
            specificDatesOff: []
        });
    });

    it('should correctly handle drivers with no off days or specific dates', () => {
        const drivers = [
            {
                offDays: [],
                specificOffDates: []
            },
            {
                offDays: [],
                specificOffDates: []
            }
        ];

        const result = getCombinedUnavailableDays(drivers);

        expect(result).toEqual({
            weekdaysOff: [],
            specificDatesOff: []
        });
    });
});
