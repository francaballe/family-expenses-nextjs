// Exportar todos los modelos para asegurar que estén registrados en Mongoose
import User from './User';
import Group from './Group';
import Role from './Role';
import Expense from './Expense';
import ClosedMonth from './ClosedMonth';

// Asegurar que los modelos estén disponibles
export { User, Group, Role, Expense, ClosedMonth };

// También los exportamos como default para uso interno
const models = {
    User,
    Group,
    Role,
    Expense,
    ClosedMonth,
};

export default models;