export const formatDateInput = (value) => {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

export const todayDateInput = () => formatDateInput(new Date());

export const parseDateInput = (value) => {
    if (!value) {
        return null;
    }

    const [year, month, day] = String(value).split('-').map(Number);

    if (!year || !month || !day) {
        return null;
    }

    return new Date(year, month - 1, day);
};

export const shiftDateInput = (value, { days = 0, months = 0 } = {}) => {
    const date = parseDateInput(value);

    if (!date) {
        return '';
    }

    if (months) {
        date.setMonth(date.getMonth() + months);
    }

    if (days) {
        date.setDate(date.getDate() + days);
    }

    return formatDateInput(date);
};

export const normalizeDateInput = (value) => {
    if (!value) {
        return '';
    }

    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    return formatDateInput(value);
};
