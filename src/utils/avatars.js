/**
 * Avatar Configuration
 * Predefined avatars for profile selection
 */
import male1 from '../images/avatars/male_1.png';
import male2 from '../images/avatars/male_2.png';
import male3 from '../images/avatars/male_3.png';
import male4 from '../images/avatars/male_4.png';
import male5 from '../images/avatars/male_5.png';
import male6 from '../images/avatars/male_6.png';
import female1 from '../images/avatars/female_1.png';
import female2 from '../images/avatars/female_2.png';
import female3 from '../images/avatars/female_3.png';
import female4 from '../images/avatars/female_4.png';
import female5 from '../images/avatars/female_5.png';
import female6 from '../images/avatars/female_6.png';

// Avatar data structure
export const AVATARS = {
    male: [
        { id: 'male_1', label: 'Male Avatar 1', image: male1 },
        { id: 'male_2', label: 'Male Avatar 2', image: male2 },
        { id: 'male_3', label: 'Male Avatar 3', image: male3 },
        { id: 'male_4', label: 'Male Avatar 4', image: male4 },
        { id: 'male_5', label: 'Male Avatar 5', image: male5 },
        { id: 'male_6', label: 'Male Avatar 6', image: male6 },
    ],
    female: [
        { id: 'female_1', label: 'Female Avatar 1', image: female1 },
        { id: 'female_2', label: 'Female Avatar 2', image: female2 },
        { id: 'female_3', label: 'Female Avatar 3', image: female3 },
        { id: 'female_4', label: 'Female Avatar 4', image: female4 },
        { id: 'female_5', label: 'Female Avatar 5', image: female5 },
        { id: 'female_6', label: 'Female Avatar 6', image: female6 },
    ],
};

// Get all avatars as flat array
export const getAllAvatars = () => {
    return [...AVATARS.male, ...AVATARS.female];
};

// Get avatar by ID
export const getAvatarById = (avatarId) => {
    const allAvatars = getAllAvatars();
    return allAvatars.find(avatar => avatar.id === avatarId);
};

// Get avatar image by ID
export const getAvatarImage = (avatarId) => {
    const avatar = getAvatarById(avatarId);
    return avatar ? avatar.image : null;
};
