import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  LogOut,
  UserPlus,
  Search,
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Trash2,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard({ setIsAuthenticated }) {
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    hired: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    job_title: "",
    resume: null,
  });

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchCandidates();
    fetchStats();
  }, [searchTerm, statusFilter]);

  const fetchCandidates = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status_filter = statusFilter;
      const response = await axios.get(`${API}/candidates`, {
        ...axiosConfig,
        params,
      });
      setCandidates(response.data);
    } catch {
      toast.error("Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/candidates/stats`, axiosConfig);
      setStats(response.data);
    } catch {
      console.error("Failed to fetch stats");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("job_title", formData.job_title);
    if (formData.resume) formDataToSend.append("resume", formData.resume);
    try {
      await axios.post(`${API}/candidates`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Candidate referred successfully!");
      setDialogOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        job_title: "",
        resume: null,
      });
      fetchCandidates();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to refer candidate");
    }
  };

  const handleStatusUpdate = async (candidateId, newStatus) => {
    try {
      await axios.put(
        `${API}/candidates/${candidateId}/status`,
        { status: newStatus },
        axiosConfig
      );
      toast.success(`Status updated to ${newStatus}`);
      fetchCandidates();
      fetchStats();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (candidateId) => {
    if (!window.confirm("Are you sure you want to delete this candidate?"))
      return;
    try {
      await axios.delete(`${API}/candidates/${candidateId}`, axiosConfig);
      toast.success("Candidate deleted successfully");
      fetchCandidates();
      fetchStats();
    } catch {
      toast.error("Failed to delete candidate");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="header-title">ReferHub</h1>
            <p className="header-subtitle">Manage Your Candidate Referrals</p>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Stats Section */}
        <div className="stats-grid">
          {[
            { icon: <Users />, label: "Total", value: stats.total },
            { icon: <Clock />, label: "Pending", value: stats.pending },
            { icon: <TrendingUp />, label: "Reviewed", value: stats.reviewed },
            { icon: <CheckCircle />, label: "Hired", value: stats.hired },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-header">
                {s.icon}
                <span className="stat-title">{s.label}</span>
              </div>
              <p className="stat-value">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter + Button */}
        <div className="actions-bar">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              placeholder="Search by name or job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            className="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Hired">Hired</option>
          </select>

          <button onClick={() => setDialogOpen(true)} className="refer-button">
            <UserPlus size={18} /> Refer Candidate
          </button>
        </div>

        {/* Candidate Cards */}
        <div className="candidates-grid">
          {loading ? (
            <p className="loading-text">Loading candidates...</p>
          ) : candidates.length === 0 ? (
            <div className="empty-state">
              <Briefcase className="empty-icon" />
              <p className="empty-title">No candidates found</p>
              <p className="empty-description">
                Start by referring your first candidate
              </p>
            </div>
          ) : (
            candidates.map((c) => (
              <div key={c.id} className="candidate-card">
                <div className="candidate-header">
                  <div>
                    <h3 className="candidate-name">{c.name}</h3>
                    <p className="candidate-email">{c.email}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="delete-button"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="candidate-info">
                  <div>
                    <b>Job:</b> {c.job_title}
                  </div>
                  <div>
                    <b>Phone:</b> {c.phone}
                  </div>

                  {c.resume_url &&
                    (() => {
                      const viewUrl = c.resume_url.replace(
                        "/upload/",
                        "/upload/f_auto/"
                      );
                      return (
                        <a
                          href={viewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="resume-link"
                        >
                          View File
                        </a>
                      );
                    })()}

                  {/* ✅ Status Dropdown */}
                  <div className="status-dropdown">
                    <label>Status: </label>
                    <select
                      className="status-select"
                      value={c.status}
                      onChange={(e) =>
                        handleStatusUpdate(c.id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Hired">Hired</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal */}
      {dialogOpen && (
        <div className="modal-overlay" onClick={() => setDialogOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Refer a New Candidate</h2>
            <p className="modal-desc">Fill in the candidate details below</p>
            <form onSubmit={handleSubmit}>
              {["name", "email", "phone", "job_title"].map((field) => (
                <div className="form-group" key={field}>
                  <label>{field.replace("_", " ").toUpperCase()}</label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    value={formData[field]}
                    onChange={(e) =>
                      setFormData({ ...formData, [field]: e.target.value })
                    }
                    required
                  />
                </div>
              ))}
              <div className="form-group">
                <label>Resume (PDF only)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setFormData({ ...formData, resume: e.target.files[0] })
                  }
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="submit-button">
                  Submit
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #e0f2fe, #f0f9ff, #fef3c7);
          font-family: "Inter", sans-serif;
        }
        .dashboard-header {
          background: white;
          padding: 1.5rem 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }
        .header-title {
          font-size: 2rem;
          font-weight: 700;
          color: #0284c7;
        }
        .logout-button {
          background: none;
          border: 1px solid #94a3b8;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
        }
        .dashboard-main {
          padding: 2rem;
          max-width: 1400px;
          margin: auto;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: white;
          padding: 1rem;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .actions-bar {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 2rem;
          align-items: center;
        }
        .search-box {
          flex: 1;
          position: relative;
        }
        .search-input {
          width: 100%;
          padding: 0.6rem 0.8rem 0.6rem 2rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
        }
        .status-filter {
          padding: 0.6rem;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
        }
        .refer-button {
          background: linear-gradient(135deg, #0284c7, #0ea5e9);
          color: white;
          padding: 0.6rem 1rem;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }
        .candidates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        .candidate-card {
          background: white;
          padding: 1.2rem;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }
        .candidate-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
        }
        .resume-link {
          color: #0284c7;
          text-decoration: none;
          font-weight: 600;
        }
        .resume-link:hover {
          text-decoration: underline;
        }
        .status-dropdown {
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .status-select {
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 0.4rem 0.8rem;
          background: #ffffff;
          color: #0f172a;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .status-select:hover {
          border-color: #0284c7;
          background: #e0f2fe;
        }
        @media (max-width: 768px) {
          .dashboard-main {
            padding: 1rem;
          }
          .actions-bar {
            flex-direction: column;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .candidates-grid {
            grid-template-columns: 1fr;
          }
          .status-filter,
          .refer-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
