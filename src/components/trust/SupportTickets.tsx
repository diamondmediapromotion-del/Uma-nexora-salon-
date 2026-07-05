import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { 
  LifeBuoy, 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  X,
  Send,
  Loader2,
  ArrowLeft
} from 'lucide-react';

interface SupportTicketsProps {
  navigateTo: (path: string) => void;
}

export default function SupportTickets({ navigateTo }: SupportTicketsProps) {
  const [session, setSession] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  
  // Create Form State
  const [formData, setFormData] = useState({
    category: 'General',
    priority: 'normal',
    subject: '',
    description: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    setSession(currentSession);
    if (currentSession) {
      fetchTickets(currentSession.user.id);
    } else {
      setLoading(false);
    }
  };

  const fetchTickets = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
        
      if (!error && data) {
        setTickets(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) return;
    
    try {
      setCreateLoading(true);
      const { data, error } = await supabase.rpc('create_support_ticket', {
        p_category: formData.category,
        p_priority: formData.priority,
        p_subject: formData.subject,
        p_description: formData.description
      });
      
      if (error) throw error;
      
      setCreateSuccess(data); // Returns ticket number
      // Refresh list
      if (session) fetchTickets(session.user.id);
      
    } catch (err) {
      console.error(err);
      alert("Failed to create ticket.");
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
            <LifeBuoy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Support Login Required</h2>
          <p className="text-slate-500 font-medium">Please login to create and track support tickets.</p>
          <div className="space-y-3 pt-4">
            <button 
              onClick={() => navigateTo('/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
            >
              Login Now
            </button>
            <button 
              onClick={() => navigateTo('/contact')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition"
            >
              Go to Contact Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper for status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-[10px] font-black uppercase tracking-wider">Open</span>;
      case 'in_progress': return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-[10px] font-black uppercase tracking-wider">In Progress</span>;
      case 'waiting_user': return <span className="px-2.5 py-1 bg-purple-50 text-purple-600 border border-purple-200 rounded-full text-[10px] font-black uppercase tracking-wider">Waiting on You</span>;
      case 'resolved': return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider">Resolved</span>;
      case 'closed': return <span className="px-2.5 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-wider">Closed</span>;
      default: return <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigateTo('/trust')}
            className="p-2 hover:bg-slate-100 rounded-xl transition flex items-center gap-2 text-slate-600 font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Trust Center
          </button>
          <button
            onClick={() => {
              setIsCreating(true);
              setCreateSuccess(null);
            }}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-slate-800 transition"
          >
            <Plus className="w-4 h-4" /> New Ticket
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 mt-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Support Tickets</h1>
            <p className="text-sm text-slate-500 font-medium">Track your requests and communicate with support.</p>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-black text-slate-900 mb-2">No tickets yet</h3>
            <p className="text-slate-500 mb-6 font-medium">You haven't created any support tickets.</p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
            >
              Create your first ticket
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map(ticket => (
              <div 
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-400">{ticket.ticket_number}</span>
                    {getStatusBadge(ticket.status)}
                    {ticket.priority === 'urgent' && (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-wider rounded-md border border-rose-100 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Urgent
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{ticket.subject}</h3>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Updated {new Date(ticket.updated_at).toLocaleDateString()}</span>
                    <span>Category: {ticket.category}</span>
                  </div>
                </div>
                <div className="text-sm font-bold text-blue-600 flex items-center gap-1">
                  View Details <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h3 className="text-lg font-black text-slate-900">Create Support Ticket</h3>
                <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {createSuccess ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Ticket Created</h3>
                    <p className="text-slate-500">Your ticket has been submitted successfully.</p>
                    <div className="inline-block px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-700">
                      Ticket Number: {createSuccess}
                    </div>
                    <div className="pt-6 flex gap-3 justify-center">
                      <button 
                        onClick={() => {
                          setIsCreating(false);
                          // Option to open ticket detail here
                        }}
                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl"
                      >
                        Close
                      </button>
                      <button 
                        onClick={() => {
                          setCreateSuccess(null);
                          setFormData({...formData, subject: '', description: ''});
                        }}
                        className="px-6 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                      >
                        Create Another
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCreateTicket} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Category *</label>
                        <select 
                          required
                          value={formData.category}
                          onChange={e => setFormData({...formData, category: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                        >
                          <option value="General">General Issue</option>
                          <option value="Booking">Booking & Appointments</option>
                          <option value="Payment">Payment & Refunds</option>
                          <option value="Account">Account Settings</option>
                          <option value="Technical">Technical Bug</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Priority</label>
                        <select 
                          value={formData.priority}
                          onChange={e => setFormData({...formData, priority: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Subject *</label>
                      <input 
                        required
                        type="text"
                        value={formData.subject}
                        onChange={e => setFormData({...formData, subject: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                        placeholder="Brief summary of the issue"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Description *</label>
                      <textarea 
                        required
                        rows={4}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white resize-none"
                        placeholder="Please provide details..."
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={createLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 mt-4"
                    >
                      {createLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      Submit Ticket
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ticket Details Drawer */}
      <AnimatePresence>
        {selectedTicket && (
          <TicketDetailDrawer 
            ticket={selectedTicket} 
            onClose={() => setSelectedTicket(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Child Component for Ticket Details
function TicketDetailDrawer({ ticket, onClose }: { ticket: any, onClose: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [ticket.id]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('support_ticket_messages')
      .select('*, sender:sender_id(email, raw_user_meta_data)')
      .eq('ticket_id', ticket.id)
      .eq('is_internal_note', false)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      setSending(true);
      await supabase.rpc('add_support_ticket_message', {
        p_ticket_id: ticket.id,
        p_message: replyText
      });
      setReplyText("");
      fetchMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-end font-sans">
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-white w-full max-w-lg min-h-screen shadow-2xl flex flex-col"
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
          <div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{ticket.ticket_number}</div>
            <h3 className="text-lg font-black text-slate-900 truncate max-w-[300px]">{ticket.subject}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {/* Original Description */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">You</div>
              <span className="text-xs font-medium text-slate-400">{new Date(ticket.created_at).toLocaleString()}</span>
            </div>
            <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
          </div>

          {/* Messages */}
          {messages.map(msg => {
            // Very simple check if it's the user who created the ticket or support agent
            // Using a basic heuristic if sender_id != ticket.user_id it's support
            const isMe = msg.sender_id === ticket.user_id;
            
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                  isMe 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                </div>
                <div className="text-[10px] font-bold text-slate-400 mt-1 px-1">
                  {!isMe ? 'Nexora Support' : 'You'} • {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply Box */}
        {ticket.status !== 'closed' && ticket.status !== 'resolved' ? (
          <div className="p-4 border-t border-slate-200 bg-white shrink-0">
            <div className="flex gap-2">
              <textarea 
                rows={2}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
              <button 
                onClick={handleReply}
                disabled={sending || !replyText.trim()}
                className="w-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl flex items-center justify-center shrink-0 transition"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-center text-sm font-bold text-slate-500 shrink-0">
            This ticket is {ticket.status}. No further replies can be added.
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ChevronRight placeholder icon component since I didn't import it at the top
const ChevronRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
);
