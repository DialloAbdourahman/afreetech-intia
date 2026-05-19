import React, { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAppSelector } from "../store/hooks";
import { getAssuranceCountForClient } from "../services/assurance.service";
import {
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
  type ClientDto,
  type CreateClientPayload,
  type UpdateClientPayload,
} from "../services/client.service";

const emptyForm: CreateClientPayload = {
  name: "",
  phone: "",
  email: "",
  address: "",
  cniNumber: "",
  branch: "Douala",
};

const ClientsPage: React.FC = () => {
  const auth = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("");
  const [form, setForm] = useState<CreateClientPayload>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [assuranceCounts, setAssuranceCounts] = useState<
    Record<string, number>
  >({});
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  async function loadClients() {
    if (!auth.token) return;
    const token = auth.token as string;
    try {
      setLoading(true);
      setError(null);
      const result = await fetchClients({
        search,
        branch: branchFilter,
        token,
      });

      if (result.code !== "SUCCESS" || !result.data) {
        setError(result.message || "Failed to load clients");
        return;
      }

      setClients(result.data);

      // Load assurance counts for each client in parallel
      const countsEntries = await Promise.all(
        result.data.map(async (client) => {
          try {
            const count = await getAssuranceCountForClient(client._id, token);
            return [client._id, count] as const;
          } catch {
            return [client._id, 0] as const;
          }
        }),
      );

      const countsMap: Record<string, number> = {};
      for (const [clientId, count] of countsEntries) {
        countsMap[clientId] = count;
      }
      setAssuranceCounts(countsMap);
    } catch (e: any) {
      setError(e?.payload?.message || e?.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.token) return;

    try {
      setLoading(true);
      setError(null);

      if (editingId) {
        const updatePayload: UpdateClientPayload = {
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          branch: form.branch,
        };

        const result = await updateClient(editingId, updatePayload, auth.token);
        if (result.code !== "SUCCESS" || !result.data) {
          setError(result.message || "Failed to update client");
          return;
        }
      } else {
        const result = await createClient(form, auth.token);
        if (result.code !== "SUCCESS" || !result.data) {
          setError(result.message || "Failed to create client");
          return;
        }
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadClients();
      setIsClientModalOpen(false);
    } catch (e: any) {
      setError(
        e?.payload?.message ||
          e?.message ||
          (editingId ? "Failed to update client" : "Failed to create client"),
      );
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(client: ClientDto) {
    setEditingId(client._id);
    setForm({
      name: client.name,
      phone: client.phone,
      email: client.email,
      address: client.address,
      cniNumber: client.cniNumber,
      branch: client.branch,
    });
    setIsClientModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!auth.token) return;
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      setLoading(true);
      setError(null);
      const result = await deleteClient(id, auth.token);
      if (result.code !== "SUCCESS") {
        setError(result.message || "Failed to delete client");
        return;
      }
      await loadClients();
    } catch (e: any) {
      setError(e?.payload?.message || e?.message || "Failed to delete client");
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function openCreateClientModal() {
    setEditingId(null);
    setForm(emptyForm);
    setIsClientModalOpen(true);
  }

  function closeClientModal() {
    setIsClientModalOpen(false);
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-inner">
          <h1>Clients</h1>
          {error && <p className="error-text">{error}</p>}

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Search by name, phone, email or CNI"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, padding: "6px 8px" }}
            />
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              style={{ padding: "6px 8px" }}
            >
              <option value="">All branches</option>
              <option value="Douala">Douala</option>
              <option value="Yaounde">Yaounde</option>
            </select>
            <button
              type="button"
              className="primary-button"
              onClick={loadClients}
              disabled={loading}
            >
              Filter
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={openCreateClientModal}
            >
              Add client
            </button>
          </div>

          {loading && !clients.length && <p>Loading clients...</p>}

          {clients.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>CNI</th>
                  <th>Branch</th>
                  <th>Assurances</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client._id}>
                    <td>{client.name}</td>
                    <td>{client.phone}</td>
                    <td>{client.email}</td>
                    <td>{client.address}</td>
                    <td>{client.cniNumber}</td>
                    <td>{client.branch}</td>
                    <td>
                      {assuranceCounts[client._id] === undefined
                        ? "--"
                        : assuranceCounts[client._id]}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => navigate(`/clients/${client._id}`)}
                      >
                        View details
                      </button>
                      <button type="button" onClick={() => handleEdit(client)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(client._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            !loading && <p>No clients found.</p>
          )}
        </div>
      </div>
      {isClientModalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>{editingId ? "Edit client" : "Add new client"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-field">
                  <label>
                    Name
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                </div>
                <div className="modal-field">
                  <label>
                    Phone
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                </div>
                <div className="modal-field">
                  <label>
                    Email
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                </div>
                <div className="modal-field">
                  <label>
                    Address
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                </div>
                <div className="modal-field">
                  <label>
                    CNI Number
                    <input
                      name="cniNumber"
                      value={form.cniNumber}
                      onChange={handleInputChange}
                      required
                      disabled={!!editingId}
                    />
                  </label>
                </div>
                <div className="modal-field">
                  <label>
                    Branch
                    <select
                      name="branch"
                      value={form.branch}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Douala">Douala</option>
                      <option value="Yaounde">Yaounde</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeClientModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : editingId
                      ? "Update client"
                      : "Create client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ClientsPage;
