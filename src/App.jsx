import React, { useState } from 'react';
import { useFirebaseCollection } from './hooks/useFirebase';
import { useAllCollection } from './hooks/useAllCollection';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TicketsView from './components/TicketsView';
import NotesView from './components/NotesView';
import TeamView from './components/TeamView';
import TicketModal from './components/TicketModal';
import ContactModal from './components/ContactModal';
import ExportModal from './components/ExportModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Toast from './components/Toast';
import { generateId } from './utils/helpers';
import { Loader2 } from 'lucide-react';

export default function App() {
    const { user, loading: authLoading, logout } = useAuth();
    
    // Solo iniciar las suscripciones si hay un usuario logueado
    const { data: ticketsUnsorted, addOrUpdateItem: saveTicket, deleteItem: removeTicket } = useFirebaseCollection('tickets', user?.uid);
    const { data: notesUnsorted, addOrUpdateItem: saveNote, deleteItem: removeNote } = useFirebaseCollection('notes', user?.uid);

    // Colecciones globales para observabilidad de equipo
    const { data: allTickets } = useAllCollection('tickets');
    const { data: allUsers } = useAllCollection('users');

    const tickets = [...ticketsUnsorted].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const notes = [...notesUnsorted].sort((a, b) => new Date(b.date) - new Date(a.date));

    const [currentView, setCurrentView] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal Visibility States
    const [isTicketModalVisible, setIsTicketModalVisible] = useState(false);
    const [isContactModalVisible, setIsContactModalVisible] = useState(false);
    const [isExportModalVisible, setIsExportModalVisible] = useState(false);
    const [deleteConfirmInfo, setDeleteConfirmInfo] = useState(null); // { type, id }
    
    // Mobile navigation state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const [currentTicketId, setCurrentTicketId] = useState(null);
    const [contactTicketData, setContactTicketData] = useState(null);

    // Advanced Filters State
    const [advStatus, setAdvStatus] = useState('');
    const [advDate, setAdvDate] = useState('');
    const [advAssignedTime, setAdvAssignedTime] = useState('');

    // Toast State
    const [toastState, setToastState] = useState({ isVisible: false, message: '', isError: false });
    const [toastTimeoutId, setToastTimeoutId] = useState(null);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    const showToast = (message, isError = false) => {
        setToastState({ isVisible: true, message, isError });
        if (toastTimeoutId) clearTimeout(toastTimeoutId);
        const id = setTimeout(() => setToastState(prev => ({ ...prev, isVisible: false })), 3000);
        setToastTimeoutId(id);
    };

    const handleFilterStatus = (status) => {
        setAdvStatus(status);
        setAdvDate('');
        setAdvAssignedTime('');
        setSearchTerm('');
        setCurrentView('tickets');
    };

    const clearAdvancedFilters = () => {
        setAdvStatus('');
        setAdvDate('');
        setAdvAssignedTime('');
    };

    const handleOpenTicket = (id = null) => {
        setCurrentTicketId(id);
        setIsTicketModalVisible(true);
    };

    const handleSaveTicket = async (ticketData, closeModal = true) => {
        let success = false;
        if (currentTicketId) {
            success = await saveTicket({ id: currentTicketId, ...ticketData });
            if (success) showToast('Ticket actualizado con éxito en la Nube');
            else showToast('Error al actualizar ticket. Verifica tu conexión.', true);
        } else {
            const newTicket = { ...ticketData, id: generateId(tickets), createdAt: new Date().toISOString() };
            success = await saveTicket(newTicket);
            if (success) showToast('Nuevo ticket creado en la Nube');
            else showToast('Error al crear ticket. Verifica tu conexión.', true);
        }
        if (success && closeModal) {
            setIsTicketModalVisible(false);
            setCurrentTicketId(null);
        }
    };

    const openDeleteConfirm = (type, id) => {
        setDeleteConfirmInfo({ type, id });
    };

    const closeDeleteConfirm = () => {
        setDeleteConfirmInfo(null);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmInfo) return;
        const { type, id } = deleteConfirmInfo;

        let success = false;
        if (type === 'ticket') {
            success = await removeTicket(id);
            if (success) {
                showToast('Ticket eliminado de la Nube', true);
                setIsTicketModalVisible(false);
            } else {
                showToast('Error al eliminar ticket. Verifica tu conexión.', true);
            }
        } else if (type === 'note') {
            success = await removeNote(id);
            if (success) showToast('Nota eliminada de la Nube', true);
            else showToast('Error al eliminar nota. Verifica tu conexión.', true);
        }

        if (success) closeDeleteConfirm();
    };

    const handleOpenContact = (ticketData) => {
        setContactTicketData(ticketData);
        setIsContactModalVisible(true);
    };

    const exportBackup = () => {
        const dataToExport = { tickets, notes };
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `AFIS_PRO_Backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        showToast('Respaldo exportado correctamente');
    };

    const importBackup = (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    for (const t of importedData) await saveTicket(t);
                    showToast('Tickets antiguos importados a la Nube');
                } else if (importedData.tickets || importedData.notes) {
                    if (importedData.tickets) {
                        for (const t of importedData.tickets) await saveTicket(t);
                    }
                    if (importedData.notes) {
                        for (const n of importedData.notes) await saveNote(n);
                    }
                    showToast('Base de datos completa importada a la Nube');
                } else {
                    showToast('Formato JSON no reconocido', true);
                }
            } catch (error) {
                showToast('Error al leer el archivo JSON', true);
            }
        };
        reader.readAsText(file);
    };

    const handleSetNotes = async (newNotesOrUpdater) => {
        if (typeof newNotesOrUpdater === 'function') {
            const updatedArray = newNotesOrUpdater(notes);
            const addedItems = updatedArray.filter(n => !notes.find(old => old.id === n.id));
            for(const item of addedItems) {
                await saveNote(item);
            }
        }
    };

    const currentTicketData = currentTicketId ? tickets.find(t => t.id === currentTicketId) : null;

    return (
        <div className="bg-slate-50 text-slate-900 font-sans flex h-screen overflow-hidden">
            <Sidebar 
                currentView={currentView} 
                setCurrentView={(view) => {
                    setCurrentView(view);
                    setIsMobileMenuOpen(false); // Close menu on navigation
                }} 
                openExportModal={() => setIsExportModalVisible(true)}
                exportBackup={exportBackup}
                importBackup={importBackup}
                onLogout={logout}
                user={user}
                ticketCounts={{
                    active: tickets.filter(t => t.status !== 'Resuelto').length,
                    critical: tickets.filter(t => (t.priority === 'Crítica' || t.priority === 'Alta') && t.status !== 'Resuelto').length
                }}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />

            <main className="flex-1 flex flex-col overflow-hidden relative">
                <Header 
                    currentView={currentView}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    openNewTicket={() => handleOpenTicket(null)}
                    onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />

                <div className="flex-1 overflow-auto p-8 relative">
                    {currentView === 'dashboard' && (
                        <Dashboard 
                            tickets={tickets} 
                            onFilterStatus={handleFilterStatus}
                            onOpenTicket={handleOpenTicket}
                        />
                    )}
                    {currentView === 'tickets' && (
                        <TicketsView 
                            tickets={tickets}
                            searchTerm={searchTerm}
                            advStatus={advStatus} setAdvStatus={setAdvStatus}
                            advDate={advDate} setAdvDate={setAdvDate}
                            advAssignedTime={advAssignedTime} setAdvAssignedTime={setAdvAssignedTime}
                            clearAdvancedFilters={clearAdvancedFilters}
                            onOpenTicket={handleOpenTicket}
                        />
                    )}
                    {currentView === 'notas' && (
                        <NotesView 
                            notes={notes}
                            setNotes={handleSetNotes}
                            showToast={showToast}
                            openDeleteConfirm={openDeleteConfirm}
                        />
                    )}
                    {currentView === 'equipo' && (
                        <TeamView 
                            allTickets={allTickets}
                            allUsers={allUsers}
                            currentUserId={user?.uid}
                        />
                    )}
                </div>
            </main>

            <TicketModal 
                isVisible={isTicketModalVisible}
                onClose={() => setIsTicketModalVisible(false)}
                ticketData={currentTicketData}
                onSave={handleSaveTicket}
                onDelete={(id) => openDeleteConfirm('ticket', id)}
                onOpenContact={handleOpenContact}
                showToast={showToast}
            />

            <ContactModal 
                isVisible={isContactModalVisible}
                onClose={() => setIsContactModalVisible(false)}
                ticketData={contactTicketData}
                showToast={showToast}
            />

            <ExportModal 
                isVisible={isExportModalVisible}
                onClose={() => setIsExportModalVisible(false)}
                tickets={tickets}
                showToast={showToast}
            />

            <DeleteConfirmModal 
                isVisible={!!deleteConfirmInfo}
                onClose={closeDeleteConfirm}
                onConfirm={confirmDelete}
            />

            <Toast {...toastState} />
        </div>
    );
}
