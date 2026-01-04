'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations = {
    en: {
        // Titles
        changePassTitle: "Change Password",
        settingsTitle: "Settings",
        usersTitle: "Users",
        greetingsTitle: "Hi",
        expensesTitle: "Expenses",
        buyingListTitle: "Buying List",
        familyExpensesTitle: "Family Expenses",
        themeSelectionTitle: "Theme Selection",
        totalExpensesTitle: "Total Expenses",
        top5ThisMonthTitle: "Top 5 This Month",
        totalDebtTitle: "Total Debt",
        totalThisMonthTitle: "Total this Month",
        expensesForTitle: "Expenses for",
        analyticsTitle: "Analytics",
        closingMonthTitle: "Are sure you want to close this month?",

        // Themes
        'theme.Mountains': "Mountains",
        'theme.Terra': "Terra",
        'theme.Ocean': "Ocean",
        'theme.Forest': "Forest",
        'theme.Nature': "Nature",
        'theme.Country': "Country",
        'theme.Flowers': "Flowers",
        'theme.GreenRiver': "Green River",
        'theme.SunnyDay': "Sunny Day",
        'theme.Surf': "Surf",
        'theme.Sunset': "Sunset",
        'theme.Greek': "Greek Style",
        'theme.BrightSea': "Bright Sea",
        'theme.FreshSalad': "Fresh Salad",
        'theme.ChichoFrozen': "Chicho Frozen",

        // Grid Headers
        gridFirstName: "First Name",
        gridLastName: "Last Name",
        gridRole: "Role",
        gridEmail: "Email",
        gridGroup: "Group",
        gridBlocked: "Blocked",
        gridLastLogin: "Last Login",
        gridCreatedDate: "Created Date",

        // Buttons
        btnNewExpense: "New Expense",
        btnMyExpenses: "My Expenses",
        btnExpenseHistory: "Test Option",
        btnCloseMonth: "Close Month",
        btnCancel: "Cancel",
        btnLogout: "Logout",
        btnRefresh: "Refresh",
        btnLoad: "Load",
        btnActive: "Show Active",
        settingsMenuChangePassBtn: "Change password",
        settingsMenuUserLogsBtn: "User Logs",
        settingsMenuAuditLogsBtn: "Audit Logs",
        settingsMenuImportLogsBtn: "Import Logs",
        settingsMenuSyncDataBtn: "Sync Data",
        settingsMenuUserBtn: "USERS",
        settingsMenuLanguageBtn: "English",
        settingsMenuDarkModeBtn: "DARK MODE",
        settingsMenuLightModeBtn: "LIGHT MODE",
        btnAddRemoveFromList: "Add / Remove from List",
        btnLogin: "Login",
        btnSaveExpense: "Save Expense",
        btnSaveExpenses: "Save Expenses",
        btnTheme: "Theme",
        btnSelectedMonth: "Selected Month",
        btnMonthSummary: "Month Summary",
        btnPayAndCloseMonth: "Pay Off Debt and Close Month",
        btnNewUser: "New User",
        btnEditUser: "Edit User",
        btnNewGroup: "New Group",

        // Tooltips
        tooltipLogout: "Log Out",
        toltipSettings: "Settings",
        goBackToolTip: "Go Back",
        homePageToolTip: "Home Page",
        addNewUserToolTip: "Add new user",
        addNewGroupToolTip: "Add new group",
        refreshUsersListToolTip: "Refresh users list",
        commentsToolTip: "Comments",
        refreshToolTip: "Refresh",

        // Placeholders
        phConfirmNewPass: "Re-enter new password",
        phCurrentPass: "Current password",
        phEmail: "Email",
        phNewPass: "Enter new password",
        phPassword: "Password",
        phExpenseDescription: "Expense Description",
        phExpenseAmount: "Expense Amount",
        phExpenseDate: "Expense Date",
        phDueDate: "Due Date",
        phAdditionalComments: "Additional Notes",
        phSearchExpenseDescOrDate: "Search for Description or Date",

        // Validations
        valEmail: "Please enter a valid email",
        valPass: "Password is too short",

        // Notifications
        invalidPassConfirm: "Passwords do not match",
        invalidPassLength: "New password must be at least 8 characters long.",
        newPassIsCurrentPass: "New password can't be the same as current password.",
        notifBinSectionRequired: "Section is required",
        notifCheckConnection: "The server failed to respond. Please check if you are connected to the VPN or if the server is running.",
        notifExpiredSession: "Your session has expired. Please login again.",
        notifInvalidLogin: "Please review login fields again.",
        notifNeedLogin: "Need to login to access this page, session may have expired. Try refreshing your browser.",
        notifTokenExpired: "User session expired.",
        notifUserOffline: "It seems you are offline. Please check your internet connection.",
        notifUpdateError: "Unknown ERROR. Update did not work.",
        notifcustNameRequired: "Customer name is required",
        notifvendNameRequired: "Vendor name is required",
        notifitemNameRequired: "Item name is required",

        // Dialogs
        diagLogout: "Are you sure you want to logout?",

        // Labels
        lbAuthenticating: "Authenticating...",
        lbLogin: "Login",
        lbRouteLoading: "Calculating route...",
        currentPass: "Current Password",
        newPass: "New Password",
        newPassConfirm: "Confirm New Password",
        rememberUser: "Remember User",
        lbVersion: "Version",
        lbClickEditUser: "Double click row to edit user",
        lbNoTop5Item: "Nothing so Far",
        lbChartOthers: "Others",
        lbNothingHere: "Oops. Nothing here",

        // Info
        infoAccCreate: "To create an account, please contact",

        // Other
        failed: "Action failed",
        success: "Action was successful",

        // CustomGrid
        phSearch: "Search...",
        btnChooseCol: "Choose columns",
        btnDefaultCol: "Default Columns",
        btnExport: "Export",
        btnShowAllCol: "Show all columns",

        // Months
        'month.january': 'January',
        'month.february': 'February',
        'month.march': 'March',
        'month.april': 'April',
        'month.may': 'May',
        'month.june': 'June',
        'month.july': 'July',
        'month.august': 'August',
        'month.september': 'September',
        'month.october': 'October',
        'month.november': 'November',
        'month.december': 'December',

        // Additional translations for consistency
        concept: "Concept",
        amount: "Amount",
        date: "Date",
        total: "Total",
        noExpenses: "No expenses this month",
        details: "Details",
        summary: "Summary",
        name: "Name",
        email: "Email",
        groupId: "Group ID",
        preferences: "Preferences",
        theme: "Theme",
        darkMode: "Dark mode",
        lightMode: "Light mode",
        language: "Language",
        english: "English",
        spanish: "Español",
        loading: "Loading...",
        error: "Error",
        cancel: "Cancel",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        close: "Close",
        remove: "Remove",
        addAnother: "Add Another Expense",
        saving: "Saving...",
        changing: "Changing...",
        expenseNumber: "Expense #{number}",
    },
    es: {
        // Titles
        changePassTitle: "Cambiar Contraseña",
        settingsTitle: "Ajustes",
        usersTitle: "Usuarios",
        greetingsTitle: "Hola",
        expensesTitle: "Gastos",
        buyingListTitle: "Lista de Compras",
        familyExpensesTitle: "Gastos Familiares",
        themeSelectionTitle: "Selección de Tema",
        totalExpensesTitle: "Gastos Totales",
        top5ThisMonthTitle: "Top 5 Este Mes",
        totalDebtTitle: "Deuda Total",
        totalThisMonthTitle: "Total este Mes",
        expensesForTitle: "Gastos de",
        analyticsTitle: "Analítica",
        closingMonthTitle: "¿Está seguro de querer cerrar este mes?",

        // Themes
        'theme.Mountains': "Montañas",
        'theme.Terra': "Terra",
        'theme.Ocean': "Océano",
        'theme.Forest': "Bosque",
        'theme.Nature': "Naturaleza",
        'theme.Country': "Campo",
        'theme.Flowers': "Flores",
        'theme.GreenRiver': "Río Verde",
        'theme.SunnyDay': "Día Soleado",
        'theme.Surf': "Surf",
        'theme.Sunset': "Puesta de Sol",
        'theme.Greek': "Estilo Griego",
        'theme.BrightSea': "Mar Brillante",
        'theme.FreshSalad': "Ensalada Fresca",
        'theme.ChichoFrozen': "Chicho Frozen",

        // Grid Headers
        gridFirstName: "Nombre",
        gridLastName: "Apellido",
        gridRole: "Rol",
        gridEmail: "Correo Electrónico",
        gridGroup: "Grupo",
        gridBlocked: "Bloqueado",
        gridLastLogin: "Último Login",
        gridCreatedDate: "Fecha de Creación",

        // Buttons
        btnNewExpense: "Nuevo Gasto",
        btnMyExpenses: "Mis Gastos",
        btnExpenseHistory: "Test Option",
        btnCloseMonth: "Cerrar Mes",
        btnCancel: "Cancelar",
        btnLogout: "Salir",
        btnRefresh: "Actualizar",
        btnLoad: "Cargar",
        btnActive: "Mostrar Activos",
        settingsMenuChangePassBtn: "Cambiar Contraseña",
        settingsMenuUserLogsBtn: "Logs de Usuario",
        settingsMenuAuditLogsBtn: "Logs de Auditoría",
        settingsMenuImportLogsBtn: "Logs de Importación",
        settingsMenuSyncDataBtn: "Sincronizar Datos",
        settingsMenuUserBtn: "USUARIOS",
        settingsMenuLanguageBtn: "Español",
        settingsMenuDarkModeBtn: "MODO OSCURO",
        settingsMenuLightModeBtn: "MODO CLARO",
        btnAddRemoveFromList: "Agregar / Remover de la Lista",
        btnLogin: "Ingresar",
        btnSaveExpense: "Grabar Gasto",
        btnSaveExpenses: "Grabar Gastos",
        btnTheme: "Tema",
        btnSelectedMonth: "Mes Seleccionado",
        btnMonthSummary: "Resumen del Mes",
        btnPayAndCloseMonth: "Saldar Deuda y Cerrar Mes",
        btnNewUser: "Nuevo Usuario",
        btnEditUser: "Editar Usuario",
        btnNewGroup: "Nuevo Grupo",

        // Tooltips
        tooltipLogout: "Cerrar sesión",
        toltipSettings: "Ajustes",
        goBackToolTip: "Regresar",
        homePageToolTip: "Página de Inicio",
        addNewUserToolTip: "Agregar nuevo usuario",
        addNewGroupToolTip: "Agregar nuevo grupo",
        refreshUsersListToolTip: "Actualizar lista de usuarios",
        commentsToolTip: "Comentarios",
        refreshToolTip: "Recargar",

        // Placeholders
        phConfirmNewPass: "Reingrese nueva contraseña",
        phCurrentPass: "Contraseña Actual",
        phEmail: "Correo Electrónico",
        phNewPass: "Ingrese nueva contraseña",
        phPassword: "Contraseña",
        phExpenseDescription: "Descripción del Gasto",
        phExpenseAmount: "Monto del Gasto",
        phExpenseDate: "Fecha del Gasto",
        phDueDate: "Fecha de Vencimiento",
        phAdditionalComments: "Comentarios Adicionales",
        phSearchExpenseDescOrDate: "Buscar por Descripción o Fecha",

        // Validations
        valEmail: "Por favor, ingrese un correo electrónico válido",
        valPass: "La contraseña ingresada es muy corta",

        // Notifications
        invalidPassConfirm: "Las contraseñas no coinciden.",
        invalidPassLength: "La nueva contraseña debe tener al menos 8 caracteres.",
        newPassIsCurrentPass: "La nueva contraseña no puede ser igual a la actual.",
        notifBinSectionRequired: "La sección es requerida",
        notifCheckConnection: "El servidor no pudo responder. Verifique si está conectado a la VPN o si el servidor está funcionando.",
        notifExpiredSession: "Su sesión ha expirado. Por favor inicie sesión nuevamente.",
        notifInvalidLogin: "Por favor revise los campos de inicio de sesión nuevamente.",
        notifNeedLogin: "Necesita iniciar sesión para acceder a esta página, la sesión puede haber expirado. Intente actualizar su navegador.",
        notifTokenExpired: "La sesión del usuario ha expirado.",
        notifUserOffline: "Parece que está desconectado. Por favor verifique su conexión a internet.",
        notifUpdateError: "ERROR desconocido. La actualización no funcionó.",
        notifcustNameRequired: "El nombre del cliente es requerido",
        notifvendNameRequired: "El nombre del proveedor es requerido",
        notifitemNameRequired: "El nombre del artículo es requerido",

        // Dialogs
        diagLogout: "¿Está seguro de que desea cerrar la sesión?",

        // Labels
        lbAuthenticating: "Autenticando...",
        lbLogin: "Ingresar",
        lbRouteLoading: "Calculando ruta...",
        currentPass: "Contraseña Actual",
        newPass: "Nueva Contraseña",
        newPassConfirm: "Confirme Nueva Contraseña",
        rememberUser: "Recordar Usuario",
        lbVersion: "Versión",
        lbClickEditUser: "Doble click en una fila para editar usuario",
        lbNoTop5Item: "Nada por Ahora",
        lbChartOthers: "Otros",
        lbNothingHere: "Ups. Nada por aquí",

        // Info
        infoAccCreate: "Para crear una cuenta, por favor contacte",

        // Other
        failed: "La acción falló",
        success: "La acción fue exitosa",

        // CustomGrid
        phSearch: "Buscar...",
        btnChooseCol: "Elegir columnas",
        btnDefaultCol: "Columnas por Defecto",
        btnExport: "Exportar",
        btnShowAllCol: "Mostrar todas las columnas",

        // Months
        'month.january': 'Enero',
        'month.february': 'Febrero',
        'month.march': 'Marzo',
        'month.april': 'Abril',
        'month.may': 'Mayo',
        'month.june': 'Junio',
        'month.july': 'Julio',
        'month.august': 'Agosto',
        'month.september': 'Septiembre',
        'month.october': 'Octubre',
        'month.november': 'Noviembre',
        'month.december': 'Diciembre',

        // Additional translations for consistency
        concept: "Concepto",
        amount: "Monto",
        date: "Fecha",
        total: "Total",
        noExpenses: "No hay gastos este mes",
        details: "Detalles",
        summary: "Resumen",
        name: "Nombre",
        email: "Email",
        groupId: "ID del Grupo",
        preferences: "Preferencias",
        theme: "Tema",
        darkMode: "Modo oscuro",
        lightMode: "Modo claro",
        language: "Idioma",
        english: "English",
        spanish: "Español",
        loading: "Cargando...",
        error: "Error",
        cancel: "Cancelar",
        save: "Guardar",
        delete: "Eliminar",
        edit: "Editar",
        close: "Cerrar",
        remove: "Eliminar",
        addAnother: "Agregar Otro Gasto",
        saving: "Guardando...",
        changing: "Cambiando...",
        expenseNumber: "Gasto #{number}",
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        // Load saved language from localStorage
        const savedLanguage = localStorage.getItem('family-expenses-language') as Language;
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
            setLanguageState(savedLanguage);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('family-expenses-language', lang);
    };

    const t = (key: string, vars?: Record<string, string>): string => {
        let translation = translations[language][key] || key;
        
        // Replace variables in translation
        if (vars) {
            Object.entries(vars).forEach(([varKey, varValue]) => {
                translation = translation.replace(new RegExp(`{${varKey}}`, 'g'), varValue);
            });
        }
        
        return translation;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};