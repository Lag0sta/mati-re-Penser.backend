import User from "../models/users";

interface authData {
    token ?: string
}

export async function checkToken({token}: authData) {
    if (!token) {
            console.warn('❌ Token manquant');
            return { result: false, error: '❌ veuillez vous connecter' };
        }

        const user = await User.findOne({ accessToken: token });

        if (!user) {
            console.warn('❌ Utilisateur non trouvé');
            return ({ result: false, error: "❌ l'utilisateur n'a pas été trouvé" });
        }

        return { result: true, user };
}