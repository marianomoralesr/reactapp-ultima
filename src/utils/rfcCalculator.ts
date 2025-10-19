interface RFCProfileData {
    first_name: string;
    last_name: string;
    mother_last_name: string;
    birth_date: string; // YYYY-MM-DD
    homoclave: string;
}

// Normalizes text according to SAT rules for RFC calculation
const normalizeText = (text: string): string => {
    if (!text) return "";
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .toUpperCase()
        .replace(/Ñ/g, "X") // Replace Ñ with X
        .replace(/&/g, "X") // Replace & with X
        .replace(/[^A-Z0-9\s]/g, "") // Remove non-alphanumeric characters except spaces
        .trim();
};

// Cleans a last name by removing common particles and joining the parts.
const cleanLastName = (lastName: string): string => {
    const text = normalizeText(lastName);
    const particles = ["DE", "DEL", "LA", "LAS", "LOS", "Y", "MC", "MAC", "VON", "VAN"];
    return text
        .split(" ")
        .filter(p => p && !particles.includes(p))
        .join(""); // Join parts without spaces, e.g., "DE LA TORRE" becomes "LATORRE"
};

// Finds the first vowel starting from the second character.
const getFirstInternalVowel = (text: string): string => {
    for (let i = 1; i < text.length; i++) {
        if ("AEIOU".includes(text[i])) return text[i];
    }
    return "X"; // Fallback
};

// Formats a YYYY-MM-DD date string into YYMMDD format.
const formatDate = (isoDate: string): string => {
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return "000000";
    const [year, month, day] = isoDate.split("-");
    return `${year.slice(-2)}${month}${day}`;
};

// List of 4-letter words that are not allowed as the RFC prefix.
const forbiddenWords = [
    "BUEI","BUEY","CACA","CACO","CAGA","CAGO","CAKA","CAKO",
    "COGE","COGI","COJA","COJE","COJI","COJO","COJONES","CULO","FETO",
    "GUEY","JOTO","KACA","KACO","KAGA","KAGO","KOGE","KOJO",
    "KAKA","KULO","MAME","MAMO","MEAR","MEAS","MEON","MION",
    "MOCO","MULA","PEDA","PEDO","PENE","PUTA","PUTO","QULO",
    "RATA","RUIN"
];

/**
 * Calculates the Mexican RFC based on user profile data.
 * @param profileData - The required user data.
 * @returns The calculated RFC string or null if data is incomplete.
 */
export const calculateRFC = (profileData: RFCProfileData): string | null => {
    const { first_name, last_name, mother_last_name, birth_date, homoclave } = profileData;

    if (!first_name || !last_name || !mother_last_name || !birth_date || !homoclave || homoclave.length !== 3) {
        return null;
    }

    const normFirstName = normalizeText(first_name);
    const normLastName = cleanLastName(last_name);
    const normMotherLastName = cleanLastName(mother_last_name);

    const nameParts = normFirstName.split(" ").filter(Boolean);
    const firstNameForRFC = (["JOSE", "MARIA"].includes(nameParts[0]) && nameParts.length > 1)
        ? nameParts[1]
        : nameParts[0];
        
    if (!firstNameForRFC || !normLastName) {
        return null; // Not enough parts to form an RFC
    }
    
    const p1 = normLastName.charAt(0);
    const p2 = getFirstInternalVowel(normLastName);
    const m1 = normMotherLastName.charAt(0) || "X"; // Use X if no maternal last name
    const n1 = firstNameForRFC.charAt(0);

    let prefix = `${p1}${p2}${m1}${n1}`;
    
    // Replace prefix if it's a forbidden word
    if (forbiddenWords.includes(prefix)) {
        prefix = prefix.substring(0, 3) + "X";
    }
    
    const datePart = formatDate(birth_date);
    
    const rfc = `${prefix}${datePart}${homoclave.toUpperCase()}`;

    return rfc;
};