import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { LayoutDashboard, Lock, Mail, Loader2 } from 'lucide-react';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            let msg = "Error al autenticar. Verifica tus datos.";
            if (err.code === 'auth/user-not-found') msg = "Usuario no encontrado.";
            if (err.code === 'auth/wrong-password') msg = "Contraseña incorrecta.";
            if (err.code === 'auth/email-already-in-use') msg = "El correo ya está registrado.";
            if (err.code === 'auth/weak-password') msg = "La contraseña debe tener al menos 6 caracteres.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-slide-up border border-slate-100">
                <div className="bg-slate-900 p-8 text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <LayoutDashboard className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">AFIS PRO</h2>
                    <p className="text-slate-400 text-sm mt-2">Sistema de Gestión de Tickets</p>
                </div>
                
                <div className="p-8">
                    <h3 className="text-xl font-semibold text-slate-800 mb-6 text-center">
                        {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </h3>
                    
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="email" 
                                    required 
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="tu@correo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="password" 
                                    required 
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isLogin ? 'Ingresar' : 'Registrarse'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button 
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                            {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
