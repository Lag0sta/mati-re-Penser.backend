import User from "../models/users";

interface authData {
    token ?: string,
    pseudo ?: string
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

//route pour une vérification Admin
export async function checkAdmin ({token, pseudo}: authData) {
    console.log('➡️ [POST] /auth', token, pseudo);

        if (!token || !pseudo) {
            console.warn('❌ Token ou pseudo manquant');
            return { result: false, error: '❌ veuillez vous connecter' };
        }
        const user = await User.findOne({ pseudo: pseudo, accessToken: token });

        if (!user) {
            console.warn('❌ Utilisateur non trouvé', user);
            return ({ result: false, error: "❌ l'utilisateur n'a pas été trouvé" });
        }

        if(!user.isAdmin) {
            console.warn(`❌ Utilisateur n'est pas administrateur'`);
            return ({ result: false, error: "❌ l'utilisateur n'est pas autorisé à l'action" })
        }

        return { result: true, user };
};