import nodemailer from 'nodemailer';
import User from '@/models/User';
import Expense from '@/models/Expense';

interface EmailData {
    monthandyear: string;
    groupid: number;
}

// Utility functions
function formatAmount(amount: number): string {
    if (amount) {
        return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return '0.00';
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function getTop5(currentMonthData: any[]): any[] {
    const expenseMap = new Map();
    
    // Aggregate expenses by description
    for (const expense of currentMonthData) {
        const description = expense.description;
        if (expenseMap.has(description)) {
            expenseMap.set(description, expenseMap.get(description) + expense.amount);
        } else {
            expenseMap.set(description, expense.amount);
        }
    }
    
    // Convert to array and sort by amount
    const aggregated = Array.from(expenseMap.entries())
        .map(([description, amount]) => ({ description, amount }))
        .sort((a, b) => b.amount - a.amount);
    
    // Return top 5, fill with empty if needed
    const top5 = [];
    for (let i = 0; i < 5; i++) {
        if (aggregated[i]) {
            top5.push({
                description: aggregated[i].description,
                amount: parseFloat(aggregated[i].amount.toString())
            });
        } else {
            top5.push({
                description: 'Nothing so Far',
                amount: 0
            });
        }
    }
    
    return top5;
}

export default async function sendEmail(dateAndGroupData: EmailData) {
    const { monthandyear, groupid } = dateAndGroupData;
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                   "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    const month = monthandyear.substring(0, 2);
    const year = monthandyear.substring(2);
    
    // Get users in group first
    const usersInGroup = await User.find({ groupid }).lean();
    if (usersInGroup.length < 2) {
        throw new Error('Group must have at least 2 users');
    }
    
    // Get expenses for the month and group
    let currentMonthData = [];
    if (monthandyear && groupid) {
        // Parse the year correctly - it comes as 4 digits in monthandyear (e.g., "122024")
        const yearPart = year.length === 2 ? '20' + year : year;
        const fullYear = parseInt(yearPart);
        const monthNum = parseInt(month);
        
        console.log('Searching expenses for:', {
            monthandyear,
            month: monthNum,
            year: fullYear,
            groupid
        });
        
        const startDate = new Date(fullYear, monthNum - 1, 1);
        const endDate = new Date(fullYear, monthNum, 0, 23, 59, 59);
        
        console.log('Date range:', {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });
        
        const userIds = usersInGroup.map(user => user._id);
        
        currentMonthData = await Expense.find({
            userid: { $in: userIds },
            expensedate: {
                $gte: startDate.toISOString(),
                $lte: endDate.toISOString()
            }
        }).populate('userid', 'firstname email groupid').lean();
        
        console.log('Found expenses:', currentMonthData.length);
        
    } else {
        throw new Error('year, month and/or groupid has not been provided.');
    }
    
    // Email configuration
    const mailConfig = {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    };
    
    if (!mailConfig.user || !mailConfig.pass) {
        throw new Error('Email credentials not configured');
    }
    
    const configuration = {
        host: "smtp.gmail.com",
        port: 587,
        auth: {
            user: mailConfig.user,
            pass: mailConfig.pass,
        },
    };
    
    const transport = nodemailer.createTransport(configuration);
    
    const firstUserId = usersInGroup[0]._id.toString();
    const from = `"Family Expenses" <${mailConfig.user}>`;
    const to = [usersInGroup[0].email, usersInGroup[1].email];
    const yearForSubject = year.length === 2 ? '20' + year : year;
    const subject = "Gastos Familiares - " + months[parseInt(month) - 1] + " " + yearForSubject;
    
    // Calculate totals and separate expenses by user
    const firstUserArray = [];
    const secondUserArray = [];
    let totalFirstUser = 0;
    let totalSecondUser = 0;
    
    for (const expense of currentMonthData) {
        if (expense.userid._id.toString() === firstUserId) {
            firstUserArray.push(expense);
            totalFirstUser += expense.amount;
        } else {
            secondUserArray.push(expense);
            totalSecondUser += expense.amount;
        }
    }
    
    totalFirstUser = parseFloat(totalFirstUser.toString());
    totalSecondUser = parseFloat(totalSecondUser.toString());
    
    // Generate HTML for expenses
    const firstUserExpensesHtml = firstUserArray.map((expense: any, index: number) => `
        <div style="background-color: ${index % 2 === 0 ? '#F0F0F0' : '#FFFFFF'};">
            <p>${expense.description} - $ ${formatAmount(expense.amount)}
            - Fecha del Gasto: ${formatDate(expense.expensedate)} 
            ${expense.duedate ? `- Vencimiento: ${formatDate(expense.duedate)}` : ''} 
            ${expense.comments ? `- Notas: ${expense.comments}` : ''}</p>
        </div>
    `).join('');
    
    const secondUserExpensesHtml = secondUserArray.map((expense: any, index: number) => `
        <div style="background-color: ${index % 2 === 0 ? '#F0F0F0' : '#FFFFFF'};">
            <p>${expense.description} - $ ${formatAmount(expense.amount)}
            - Fecha del Gasto: ${formatDate(expense.expensedate)} 
            ${expense.duedate ? `- Vencimiento: ${formatDate(expense.duedate)}` : ''} 
            ${expense.comments ? `- Notas: ${expense.comments}` : ''}</p>
        </div>
    `).join('');
    
    const myTop5 = getTop5(currentMonthData);
    
    const msg = {
        from,
        to,
        subject,
        html: `<div>
                <hr style="border-top: 2px solid purple; width: 100%; margin: 10px 0;">
                <h2>Resumen de Gastos del Mes</h2>
                <hr style="border-top: 2px solid purple; width: 100%; margin: 10px 0;">
                <div>
                    <h3 style="color: purple; margin-right: 10px; display: inline-block;">Total ${usersInGroup[0].firstname}:</h3>
                    <p style="margin: 0; display: inline-block;">$ ${formatAmount(totalFirstUser)}</p>
                </div>
                <div>
                    <h3 style="color: purple; margin-right: 10px; display: inline-block;">Total ${usersInGroup[1].firstname}:</h3>
                    <p style="margin: 0; display: inline-block;">$ ${formatAmount(totalSecondUser)}</p>
                </div>
                <div>
                    <h3 style="color: purple; margin-right: 10px; display: inline-block;">Gastos Totales:</h3>
                    <p style="margin: 0; display: inline-block;">$ ${formatAmount(totalFirstUser + totalSecondUser)}</p>
                </div>            
                <hr style="border-top: 2px solid purple; width: 100%; margin: 10px 0;">                
                <h2>TOP 5</h2>
                <hr style="border-top: 2px solid purple; width: 100%; margin: 10px 0;">
                <div>                    
                    <h3 style="color: purple; margin-right: 10px; display: inline-block;">${myTop5[0].description}:</h3>
                    <p style="margin: 0; display: inline-block;">$ ${formatAmount(myTop5[0].amount)}</p>
                </div>
                <div>                     
                    <h3 style="color: purple; margin-right: 10px; display: inline-block;">${myTop5[1].description}:</h3>
                    <p style="margin: 0; display: inline-block;">$ ${formatAmount(myTop5[1].amount)}</p>
                </div>
                <div>                     
                    <h3 style="color: purple; margin-right: 10px; display: inline-block;">${myTop5[2].description}:</h3>
                    <p style="margin: 0; display: inline-block;">$ ${formatAmount(myTop5[2].amount)}</p>
                </div>
                <div>                    
                    <h3 style="color: purple; margin-right: 10px; display: inline-block;">${myTop5[3].description}:</h3>
                    <p style="margin: 0; display: inline-block;">$ ${formatAmount(myTop5[3].amount)}</p>
                </div>
                <div>
                    <h3 style="color: purple; margin-right: 10px; display: inline-block;">${myTop5[4].description}:</h3>
                    <p style="margin: 0; display: inline-block;">$ ${formatAmount(myTop5[4].amount)}</p>
                </div>                
                <hr style="border-top: 2px solid purple; width: 100%; margin: 10px 0;">
                <div>
                    <h2>Gastos de ${usersInGroup[0].firstname}</h2>
                    <hr style="border-top: 2px solid purple; width: 100%; margin: 10px 0;">
                    ${firstUserExpensesHtml}
                    <hr style="border-top: 2px solid purple; width: 100%; margin: 10px 0;">
                    <h2>Gastos de ${usersInGroup[1].firstname}</h2>
                    <hr style="border-top: 2px solid purple; width: 100%; margin: 10px 0;">
                    ${secondUserExpensesHtml}
                    <hr style="border-top: 2px solid purple; width: 100%; margin: 10px 0;">
                </div>
            </div>`
    };
    
    // Send email
    try {
        await transport.sendMail(msg);
        return { status: "OK" };
    } catch (error: any) {
        console.error('Error when trying to send email:', error);
        throw new Error(`Error when trying to send email: ${error.message}`);
    }
}