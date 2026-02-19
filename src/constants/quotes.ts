export const lifeQuotes = [
    "Simplicity is the ultimate sophistication.",
    "Life is what happens when you're busy making other plans.",
    "The only way to do great work is to love what you do.",
    "Every moment is a fresh beginning.",
    "Change the world by being yourself.",
    "Whatever you are, be a good one.",
    "Happiness depends upon ourselves.",
    "Turn your wounds into wisdom.",
    "Don't count the days, make the days count.",
    "The best way to predict the future is to create it.",
    "Be the change that you wish to see in the world.",
    "Stay hungry, stay foolish.",
    "Life is short, and it is up to you to make it sweet.",
    "Small steps in the right direction can turn out to be the biggest step of your life.",
    "Believe you can and you're halfway there.",
];

export function getLifeQuote(): string {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
        hash = (hash << 5) - hash + today.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    const index = Math.abs(hash) % lifeQuotes.length;
    return lifeQuotes[index];
}
