import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  LifeBuoy, 
  MessageSquare, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  X,
  Send,
  Loader2,
  Lock,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export default function SupportAdmin() {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'tickets' | 'inquiries' | 'legal' | 'consents'>('overview');
  
  // Return the main shell
  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        {[
          { id: 'overview', label: 'Overview', icon: LifeBuoy },
          { id: 'tickets', label: 'Support Tickets', icon: MessageSquare },
          { id: 'inquiries', label: 'Contact Inquiries', icon: Send },
          { id: 'legal', label: 'Legal Pages', icon: FileText },
          { id: 'consents', label: 'Policy Consents', icon: UserCheck }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 ${
              activeSubTab === tab.id 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeSubTab === 'overview' && <SupportOverview />}
        {activeSubTab === 'tickets' && <AdminTicketsList />}
        {activeSubTab === 'inquiries' && <AdminInquiriesList />}
        {activeSubTab === 'legal' && <AdminLegalPages />}
        {activeSubTab === 'consents' && <AdminConsentsList />}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Sub Components
// ----------------------------------------------------

function SupportOverview() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const { data, error } = await supabase.rpc('admin_get_support_summary');
      if (data) setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" /></div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Open Tickets" value={summary?.open_tickets || 0} color="text-amber-600" bg="bg-amber-50" border="border-amber-100" />
      <StatCard label="In Progress" value={summary?.in_progress_tickets || 0} color="text-blue-600" bg="bg-blue-50" border="border-blue-100" />
      <StatCard label="Waiting User" value={summary?.waiting_tickets || 0} color="text-purple-600" bg="bg-purple-50" border="border-purple-100" />
      <StatCard label="Resolved Tickets" value={summary?.resolved_tickets || 0} color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-100" />
      
      <StatCard label="Urgent Tickets" value={summary?.urgent_tickets || 0} color="text-rose-600" bg="bg-rose-50" border="border-rose-100" />
      <StatCard label="Open Inquiries" value={summary?.open_inquiries || 0} color="text-indigo-600" bg="bg-indigo-50" border="border-indigo-100" />
      <StatCard label="Published Pages" value={summary?.published_pages || 0} color="text-slate-700" bg="bg-slate-100" border="border-slate-200" />
      <StatCard label="Policy Consents" value={summary?.total_consents || 0} color="text-slate-700" bg="bg-slate-100" border="border-slate-200" />
    </div>
  );
}

function StatCard({ label, value, color, bg, border }: { label: string, value: number, color: string, bg: string, border: string }) {
  return (
    <div className={`p-5 rounded-2xl border ${bg} ${border}`}>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}

function AdminTicketsList() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*, user:user_id(email, raw_user_meta_data)')
        .order('updated_at', { ascending: false });
      if (data) setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" /></div>;

  return (
    <div className="space-y-4">
      {tickets.map(ticket => (
        <div key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer flex items-center justify-between hover:shadow-md transition">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black text-slate-400">{ticket.ticket_number}</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-wider">{ticket.status}</span>
              {ticket.priority === 'urgent' && <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md text-[10px] font-black uppercase tracking-wider">Urgent</span>}
            </div>
            <h4 className="font-bold text-slate-900">{ticket.subject}</h4>
            <p className="text-xs font-medium text-slate-500 mt-1">{ticket.user?.email || 'Unknown User'}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300" />
        </div>
      ))}
      
      {/* Selected Ticket Modal */}
      {selectedTicket && (
        <AdminTicketDetail 
          ticket={selectedTicket} 
          onClose={() => {
            setSelectedTicket(null);
            fetchTickets();
          }} 
        />
      )}
    </div>
  );
}

function AdminTicketDetail({ ticket, onClose }: { ticket: any, onClose: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);

  useEffect(() => {
    fetchMessages();
  }, [ticket.id]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('support_ticket_messages')
      .select('*, sender:sender_id(email)')
      .eq('ticket_id', ticket.id)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const handleUpdateStatus = async () => {
    await supabase.rpc('admin_update_support_ticket_status', {
      p_ticket_id: ticket.id,
      p_status: status,
      p_priority: priority
    });
    alert("Updated!");
  };

  const handleReply = async () => {
    if(!replyText.trim()) return;
    await supabase.rpc('add_support_ticket_message', {
      p_ticket_id: ticket.id,
      p_message: replyText,
      p_is_internal_note: isInternal
    });
    setReplyText("");
    fetchMessages();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-end font-sans">
      <div className="bg-white w-full max-w-2xl min-h-screen shadow-2xl flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
          <div>
            <h3 className="text-lg font-black text-slate-900">{ticket.ticket_number}</h3>
            <p className="text-sm font-medium text-slate-500">{ticket.user?.email}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
            <div>
              <label className="text-3xs font-black uppercase tracking-widest text-slate-400">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full text-sm font-medium p-2 border border-slate-200 rounded-lg mt-1">
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_user">Waiting User</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="spam">Spam</option>
              </select>
            </div>
            <div>
              <label className="text-3xs font-black uppercase tracking-widest text-slate-400">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full text-sm font-medium p-2 border border-slate-200 rounded-lg mt-1">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <button onClick={handleUpdateStatus} className="col-span-2 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest">Update Meta</button>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-2">{ticket.subject}</h4>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          <div className="space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`p-4 rounded-xl border ${msg.is_internal_note ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                {msg.is_internal_note && <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-1"><Lock className="w-3 h-3" /> Internal Note</div>}
                <p className="text-sm whitespace-pre-wrap text-slate-700">{msg.message}</p>
                <div className="text-[10px] font-bold text-slate-400 mt-2">{msg.sender?.email} • {new Date(msg.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-4 mb-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
              <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} className="rounded text-amber-600" />
              Internal Note (Hidden from user)
            </label>
          </div>
          <div className="flex gap-2">
            <textarea 
              rows={3}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
            />
            <button 
              onClick={handleReply}
              className={`px-6 text-white font-bold rounded-xl flex items-center justify-center shrink-0 ${isInternal ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminInquiriesList() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  useEffect(() => {
    supabase.from('contact_inquiries').select('*').order('created_at', { ascending: false }).then(({data}) => {
      if(data) setInquiries(data);
    });
  }, []);

  return (
    <div className="space-y-4">
      {inquiries.map(inq => (
        <div key={inq.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-black text-slate-400">{inq.id.split('-')[0]}</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-wider">{inq.status}</span>
          </div>
          <h4 className="font-bold text-slate-900 mb-1">{inq.subject}</h4>
          <p className="text-sm text-slate-700 mb-3">{inq.message}</p>
          <div className="text-xs font-medium text-slate-500">
            From: {inq.name} ({inq.email}) {inq.mobile && `• ${inq.mobile}`}
          </div>
        </div>
      ))}
      {inquiries.length === 0 && <div className="text-slate-500 p-4">No inquiries.</div>}
    </div>
  );
}

function AdminLegalPages() {
  const [pages, setPages] = useState<any[]>([]);
  const [editingPage, setEditingPage] = useState<any>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    const { data } = await supabase.from('legal_pages').select('*').order('slug');
    if (data) setPages(data);
  };

  const savePage = async () => {
    if(!editingPage) return;
    try {
      if (editingPage.id) {
        await supabase.from('legal_pages').update({
          title: editingPage.title,
          subtitle: editingPage.subtitle,
          content_markdown: editingPage.content_markdown,
          status: editingPage.status,
          version: editingPage.version,
          updated_at: new Date()
        }).eq('id', editingPage.id);
      } else {
        await supabase.from('legal_pages').insert([editingPage]);
      }
      setEditingPage(null);
      fetchPages();
    } catch(err) {
      console.error(err);
      alert("Save failed");
    }
  };

  if (editingPage) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black">{editingPage.id ? 'Edit Page' : 'New Page'}</h3>
          <button onClick={() => setEditingPage(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-3xs font-black uppercase tracking-widest text-slate-400">Slug</label>
            <input type="text" value={editingPage.slug || ''} onChange={e => setEditingPage({...editingPage, slug: e.target.value})} className="w-full text-sm font-medium p-2 border border-slate-200 rounded-lg mt-1" disabled={!!editingPage.id} />
          </div>
          <div>
            <label className="text-3xs font-black uppercase tracking-widest text-slate-400">Status</label>
            <select value={editingPage.status || 'draft'} onChange={e => setEditingPage({...editingPage, status: e.target.value})} className="w-full text-sm font-medium p-2 border border-slate-200 rounded-lg mt-1">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-3xs font-black uppercase tracking-widest text-slate-400">Title</label>
          <input type="text" value={editingPage.title || ''} onChange={e => setEditingPage({...editingPage, title: e.target.value})} className="w-full text-sm font-medium p-2 border border-slate-200 rounded-lg mt-1" />
        </div>

        <div>
          <label className="text-3xs font-black uppercase tracking-widest text-slate-400">Content (Markdown)</label>
          <textarea rows={12} value={editingPage.content_markdown || ''} onChange={e => setEditingPage({...editingPage, content_markdown: e.target.value})} className="w-full text-sm font-medium p-3 border border-slate-200 rounded-lg mt-1 font-mono resize-none"></textarea>
        </div>
        
        <div className="bg-amber-50 text-amber-700 p-3 rounded-lg text-xs font-bold border border-amber-100 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Legal copy must be reviewed before final launch.
        </div>

        <button onClick={savePage} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700">Save Page</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setEditingPage({ status: 'draft', version: '1.0.0' })} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold">Add Page</button>
      </div>
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="p-4">Slug</th>
              <th className="p-4">Title</th>
              <th className="p-4">Status</th>
              <th className="p-4">Updated</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {pages.map(page => (
              <tr key={page.id} className="hover:bg-slate-50">
                <td className="p-4 text-slate-500 font-mono text-xs">{page.slug}</td>
                <td className="p-4 text-slate-900">{page.title}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${page.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>{page.status}</span>
                </td>
                <td className="p-4 text-slate-500 text-xs">{new Date(page.updated_at).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <button onClick={() => setEditingPage(page)} className="text-blue-600 font-bold hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages.length === 0 && <div className="p-8 text-center text-slate-500">No pages found.</div>}
      </div>
    </div>
  );
}

function AdminConsentsList() {
  const [consents, setConsents] = useState<any[]>([]);
  useEffect(() => {
    supabase.from('user_policy_consents').select('*, user:user_id(email)').order('consented_at', { ascending: false }).limit(50).then(({data}) => {
      if(data) setConsents(data);
    });
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
       <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Policy</th>
              <th className="p-4">Version</th>
              <th className="p-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {consents.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="p-4">{c.user?.email || c.user_id}</td>
                <td className="p-4">{c.policy_slug}</td>
                <td className="p-4 text-slate-400">{c.version}</td>
                <td className="p-4 text-slate-400 text-xs">{new Date(c.consented_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {consents.length === 0 && <div className="p-8 text-center text-slate-500">No consents recorded yet.</div>}
    </div>
  );
}
