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
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà.' });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10); // 10 est le nombre de tours de salage

    // Créer l'utilisateur
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

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur interne du serveur lors de la création du compte.' });
  }
}