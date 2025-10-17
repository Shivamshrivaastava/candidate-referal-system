import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

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
    } catch (error) {
      toast.error("Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/candidates/stats`, axiosConfig);
      setStats(response.data);
    } catch (error) {
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
    if (formData.resume) {
      formDataToSend.append("resume", formData.resume);
    }

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
    } catch (error) {
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
    } catch (error) {
      toast.error("Failed to delete candidate");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "status-pending";
      case "Reviewed":
        return "status-reviewed";
      case "Hired":
        return "status-hired";
      default:
        return "";
    }
  };

  return (
    <div className="dashboard-container" data-testid="dashboard-page">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="header-title" data-testid="dashboard-title">
              ReferHub
            </h1>
            <p className="header-subtitle">Manage Your Candidate Referrals</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            data-testid="logout-button"
            className="logout-button"
          >
            <LogOut className="icon" />
            Logout
          </Button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="stats-grid" data-testid="stats-section">
          <Card className="stat-card stat-card-1">
            <CardHeader className="stat-header">
              <Users className="stat-icon" />
              <CardTitle className="stat-title">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="stat-value" data-testid="stat-total">
                {stats.total}
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card stat-card-2">
            <CardHeader className="stat-header">
              <Clock className="stat-icon" />
              <CardTitle className="stat-title">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="stat-value" data-testid="stat-pending">
                {stats.pending}
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card stat-card-3">
            <CardHeader className="stat-header">
              <TrendingUp className="stat-icon" />
              <CardTitle className="stat-title">Reviewed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="stat-value" data-testid="stat-reviewed">
                {stats.reviewed}
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card stat-card-4">
            <CardHeader className="stat-header">
              <CheckCircle className="stat-icon" />
              <CardTitle className="stat-title">Hired</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="stat-value" data-testid="stat-hired">
                {stats.hired}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="actions-bar">
          <div className="search-filters">
            <div className="search-box">
              <Search className="search-icon" />
              <Input
                placeholder="Search by name or job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="search-input"
                className="search-input"
              />
            </div>

            <Select
              value={statusFilter || "all"}
              onValueChange={(value) =>
                setStatusFilter(value === "all" ? "" : value)
              }
            >
              <SelectTrigger
                className="filter-select"
                data-testid="status-filter"
              >
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Reviewed">Reviewed</SelectItem>
                <SelectItem value="Hired">Hired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="refer-button"
                data-testid="add-candidate-button"
              >
                <UserPlus className="icon" />
                Refer Candidate
              </Button>
            </DialogTrigger>
            <DialogContent
              className="dialog-content"
              data-testid="referral-dialog"
            >
              <DialogHeader>
                <DialogTitle data-testid="dialog-title">
                  Refer a New Candidate
                </DialogTitle>
                <DialogDescription data-testid="dialog-description">
                  Fill in the candidate details below
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="referral-form">
                <div className="form-group">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    data-testid="candidate-name-input"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    data-testid="candidate-email-input"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    data-testid="candidate-phone-input"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    data-testid="candidate-job-title-input"
                    value={formData.job_title}
                    onChange={(e) =>
                      setFormData({ ...formData, job_title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="resume">Resume (PDF only)</Label>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf"
                    data-testid="candidate-resume-input"
                    onChange={(e) =>
                      setFormData({ ...formData, resume: e.target.files[0] })
                    }
                  />
                </div>

                <Button
                  type="submit"
                  className="submit-button"
                  data-testid="submit-referral-button"
                >
                  Submit Referral
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="candidates-grid" data-testid="candidates-list">
          {loading ? (
            <p className="loading-text">Loading candidates...</p>
          ) : candidates.length === 0 ? (
            <Card className="empty-state">
              <CardContent className="empty-content">
                <Briefcase className="empty-icon" />
                <p className="empty-title">No candidates found</p>
                <p className="empty-description">
                  Start by referring your first candidate
                </p>
              </CardContent>
            </Card>
          ) : (
            candidates.map((candidate) => (
              <Card
                key={candidate.id}
                className="candidate-card"
                data-testid="candidate-card"
              >
                <CardHeader>
                  <div className="candidate-header">
                    <div>
                      <h3
                        className="candidate-name"
                        data-testid="candidate-name"
                      >
                        {candidate.name}
                      </h3>
                      <p
                        className="candidate-email"
                        data-testid="candidate-email"
                      >
                        {candidate.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(candidate.id)}
                      data-testid="delete-candidate-button"
                      className="delete-button"
                    >
                      <Trash2 className="delete-icon" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="candidate-content">
                  <div className="candidate-info">
                    <div className="info-row">
                      <Briefcase className="info-icon" />
                      <span data-testid="candidate-job-title">
                        {candidate.job_title}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Phone:</span>
                      <span data-testid="candidate-phone">
                        {candidate.phone}
                      </span>
                    </div>
                    {candidate.resume_url &&
                      (() => {
                        // This ensures Cloudinary sends the correct MIME type for PDF
                        const viewUrl = candidate.resume_url.replace(
                          "/upload/",
                          "/upload/f_auto/"
                        );

                        return (
                          <a
                            href={viewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="resume-link"
                            data-testid="resume-link"
                          >
                            View File
                          </a>
                        );
                      })()}
                  </div>

                  <div className="status-section">
                    <Label>Status</Label>
                    <Select
                      value={candidate.status}
                      onValueChange={(value) =>
                        handleStatusUpdate(candidate.id, value)
                      }
                    >
                      <SelectTrigger
                        className={`status-select ${getStatusColor(
                          candidate.status
                        )}`}
                        data-testid="status-select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Reviewed">Reviewed</SelectItem>
                        <SelectItem value="Hired">Hired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(
            135deg,
            #e0f2fe 0%,
            #f0f9ff 50%,
            #fef3c7 100%
          );
        }

        .dashboard-header {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          padding: 1.5rem 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-title {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .header-subtitle {
          color: #64748b;
          margin-top: 0.25rem;
        }

        .logout-button {
          border: 1px solid #cbd5e1;
          transition: all 0.2s;
        }

        .logout-button:hover {
          border-color: #0284c7;
          color: #0284c7;
        }

        .dashboard-main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-bottom: 0.5rem;
        }

        .stat-icon {
          width: 24px;
          height: 24px;
        }

        .stat-card-1 .stat-icon {
          color: #0284c7;
        }
        .stat-card-2 .stat-icon {
          color: #f59e0b;
        }
        .stat-card-3 .stat-icon {
          color: #8b5cf6;
        }
        .stat-card-4 .stat-icon {
          color: #10b981;
        }

        .stat-title {
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 600;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .actions-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .search-filters {
          display: flex;
          gap: 1rem;
          flex: 1;
          max-width: 600px;
        }

        .search-box {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          color: #94a3b8;
        }

        .search-input {
          padding-left: 40px;
        }

        .filter-select {
          min-width: 180px;
        }

        .refer-button {
          background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
          border: none;
          font-weight: 600;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .refer-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(2, 132, 199, 0.3);
        }

        .icon {
          width: 18px;
          height: 18px;
          margin-right: 8px;
        }

        .candidates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .candidate-card {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .candidate-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
        }

        .candidate-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
        }

        .candidate-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.25rem 0;
        }

        .candidate-email {
          color: #64748b;
          font-size: 0.9rem;
          margin: 0;
        }

        .delete-button {
          color: #ef4444;
          transition: background-color 0.2s;
        }

        .delete-button:hover {
          background-color: #fee2e2;
        }

        .delete-icon {
          width: 18px;
          height: 18px;
        }

        .candidate-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .candidate-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #475569;
        }

        .info-icon {
          width: 16px;
          height: 16px;
          color: #0284c7;
        }

        .info-label {
          font-weight: 600;
          color: #64748b;
        }

        .resume-link {
          color: #0284c7;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
          font-size: 0.9rem;
        }

        .resume-link:hover {
          color: #0369a1;
          text-decoration: underline;
        }

        .status-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .status-select {
          font-weight: 600;
        }

        .status-pending {
          background-color: #fef3c7;
          color: #92400e;
          border-color: #fbbf24;
        }

        .status-reviewed {
          background-color: #e0e7ff;
          color: #4338ca;
          border-color: #818cf8;
        }

        .status-hired {
          background-color: #d1fae5;
          color: #065f46;
          border-color: #34d399;
        }

        .empty-state {
          grid-column: 1 / -1;
          background: white;
        }

        .empty-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          color: #cbd5e1;
          margin-bottom: 1rem;
        }

        .empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #334155;
          margin: 0 0 0.5rem 0;
        }

        .empty-description {
          color: #64748b;
          margin: 0;
        }

        .dialog-content {
          max-width: 500px;
        }

        .referral-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .submit-button {
          margin-top: 0.5rem;
          background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
          border: none;
          font-weight: 600;
        }

        .loading-text {
          grid-column: 1 / -1;
          text-align: center;
          color: #64748b;
          padding: 3rem;
        }

        @media (max-width: 768px) {
          .dashboard-main {
            padding: 1rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .actions-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-filters {
            max-width: 100%;
            flex-direction: column;
          }

          .candidates-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
