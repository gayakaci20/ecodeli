import bcrypt from 'bcrypt';
import { prisma } from '../../../src/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { firstName, lastName, email, phone, password } = req.body;

  // Validation simple (peut être étendue)
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'Veuillez fournir le prénom, le nom, l\'email et le mot de passe.' });
  }

  try {
    // Log pour diagnostiquer des problèmes potentiels
    console.log(`Tentative d'inscription pour: ${email}`);
    
    // Vérifier si l'utilisateur existe déjà
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà.' });
      }
    } catch (findError) {
      console.error('Erreur lors de la vérification d\'email existant:', findError);
      return res.status(500).json({ 
        message: 'Erreur lors de la vérification de l\'email.',
        error: process.env.NODE_ENV === 'development' ? findError.message : undefined
      });
    }

    // Hacher le mot de passe
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10); // 10 est le nombre de tours de salage
    } catch (hashError) {
      console.error('Erreur lors du hachage du mot de passe:', hashError);
      return res.status(500).json({ 
        message: 'Erreur lors du traitement du mot de passe',
        error: process.env.NODE_ENV === 'development' ? hashError.message : undefined
      });
    }

    // Créer l'utilisateur
    try {
      console.log('Tentative de création de l\'utilisateur dans la base de données');
      const newUser = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          phoneNumber: phone, // Assurez-vous que le nom correspond au schéma
          password: hashedPassword,
          // Le rôle par défaut est SENDER (défini dans le schéma)
        },
      });

      // Ne pas renvoyer le mot de passe haché
      const { password: _, ...userWithoutPassword } = newUser;
      console.log('Utilisateur créé avec succès:', email);
      
      return res.status(201).json(userWithoutPassword);
    } catch (createError) {
      console.error('Erreur détaillée lors de la création de l\'utilisateur:', createError);
      
      // Journal plus détaillé pour les problèmes fréquents
      if (createError.code === 'P2002') {
        return res.status(409).json({ 
          message: 'Un utilisateur avec cet email ou numéro de téléphone existe déjà.',
          field: createError.meta?.target?.[0] || 'unknown',
          error: process.env.NODE_ENV === 'development' ? createError.message : undefined
        });
      }
      
      // Détails de l'erreur dans la réponse en mode développement
      return res.status(500).json({ 
        message: 'Erreur lors de la création du compte utilisateur.',
        error: process.env.NODE_ENV === 'development' ? createError.message : undefined
      });
    }
  } catch (error) {
    console.error('Erreur générale lors de l\'inscription:', error);
    res.status(500).json({ 
      message: 'Erreur interne du serveur lors de la création du compte.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}