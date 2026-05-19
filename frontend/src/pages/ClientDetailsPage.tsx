import React, { useEffect, useState, FormEvent } from "react";
import { useParams } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import { useAppSelector } from "../store/hooks";
import { getClientById, type ClientDto } from "../services/client.service";
import {
  fetchAssurances,
  createAssurance,
  updateAssurance,
  deleteAssurance,
  type AssuranceDto,
  type CreateAssurancePayload,
  type UpdateAssurancePayload,
} from "../services/assurance.service";

const ClientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const auth = useAppSelector((state) => state.auth);
  const [client, setClient] = useState<ClientDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assurances, setAssurances] = useState<AssuranceDto[]>([]);
  const [assurancesLoading, setAssurancesLoading] = useState(false);
  const [assuranceForm, setAssuranceForm] =
    useState<CreateAssurancePayload | null>(null);
  const [editingAssuranceId, setEditingAssuranceId] = useState<string | null>(
    null,
  );
  const [isAssuranceModalOpen, setIsAssuranceModalOpen] = useState(false);

  useEffect(() => {
    async function loadClient() {
      if (!id || !auth.token) return;

      try {
        setLoading(true);
        setError(null);
        const result = await getClientById(id, auth.token);

        if (result.code !== "SUCCESS" || !result.data) {
          setError(result.message || "Failed to load client");
          return;
        }

        setClient(result.data);
      } catch (e: any) {
        setError(e?.payload?.message || e?.message || "Failed to load client");
      } finally {
        setLoading(false);
      }
    }

    loadClient();
  }, [id, auth.token]);

  useEffect(() => {
    async function loadAssurances() {
      if (!id || !auth.token) return;

      try {
        setAssurancesLoading(true);
        setError(null);
        const result = await fetchAssurances({
          clientId: id,
          token: auth.token,
        });

        if (result.code !== "SUCCESS" || !result.data) {
          setError(result.message || "Failed to load assurances");
          return;
        }

        setAssurances(result.data);
      } catch (e: any) {
        setError(
          e?.payload?.message || e?.message || "Failed to load assurances",
        );
      } finally {
        setAssurancesLoading(false);
      }
    }

    loadAssurances();
  }, [id, auth.token]);

  function startCreateAssurance() {
    if (!id) return;
    setEditingAssuranceId(null);
    setAssuranceForm({
      clientId: id,
      type: "",
      policyNumber: "",
      startDate: "",
      endDate: "",
      amount: 0,
      status: "active",
    });
    setIsAssuranceModalOpen(true);
  }

  function startEditAssurance(assurance: AssuranceDto) {
    if (!id) return;
    setEditingAssuranceId(assurance._id);
    setAssuranceForm({
      clientId: id,
      type: assurance.type,
      policyNumber: assurance.policyNumber,
      startDate: assurance.startDate.slice(0, 10),
      endDate: assurance.endDate.slice(0, 10),
      amount: assurance.amount,
      status: assurance.status,
    });
    setIsAssuranceModalOpen(true);
  }

  function handleAssuranceInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    if (!assuranceForm) return;
    const { name, value } = e.target;
    setAssuranceForm((prev) =>
      prev
        ? {
            ...prev,
            [name]:
              name === "amount" ? (value === "" ? 0 : Number(value)) : value,
          }
        : prev,
    );
  }

  async function handleAssuranceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id || !auth.token || !assuranceForm) return;

    try {
      setAssurancesLoading(true);
      setError(null);

      if (editingAssuranceId) {
        const updatePayload: UpdateAssurancePayload = {
          type: assuranceForm.type,
          policyNumber: assuranceForm.policyNumber,
          startDate: assuranceForm.startDate,
          endDate: assuranceForm.endDate,
          amount: assuranceForm.amount,
          status: assuranceForm.status,
        };

        const result = await updateAssurance(
          editingAssuranceId,
          updatePayload,
          auth.token,
        );

        if (result.code !== "SUCCESS" || !result.data) {
          setError(result.message || "Failed to update assurance");
          return;
        }
      } else {
        const result = await createAssurance(assuranceForm, auth.token);
        if (result.code !== "SUCCESS" || !result.data) {
          setError(result.message || "Failed to create assurance");
          return;
        }
      }

      setAssuranceForm(null);
      setEditingAssuranceId(null);

      const reload = await fetchAssurances({ clientId: id, token: auth.token });
      if (reload.code === "SUCCESS" && reload.data) {
        setAssurances(reload.data);
      }
    } catch (e: any) {
      setError(
        e?.payload?.message ||
          e?.message ||
          (editingAssuranceId
            ? "Failed to update assurance"
            : "Failed to create assurance"),
      );
    } finally {
      setAssurancesLoading(false);
    }
  }

  function closeAssuranceModal() {
    setIsAssuranceModalOpen(false);
    setAssuranceForm(null);
    setEditingAssuranceId(null);
  }

  async function handleAssuranceDelete(idToDelete: string) {
    if (!id || !auth.token) return;
    if (!window.confirm("Are you sure you want to delete this assurance?"))
      return;

    try {
      setAssurancesLoading(true);
      setError(null);
      const result = await deleteAssurance(idToDelete, auth.token);
      if (result.code !== "SUCCESS") {
        setError(result.message || "Failed to delete assurance");
        return;
      }

      const reload = await fetchAssurances({ clientId: id, token: auth.token });
      if (reload.code === "SUCCESS" && reload.data) {
        setAssurances(reload.data);
      }
    } catch (e: any) {
      setError(
        e?.payload?.message || e?.message || "Failed to delete assurance",
      );
    } finally {
      setAssurancesLoading(false);
    }
  }

  return (
    <SidebarLayout>
      <div className="dashboard-container">
        <div className="dashboard-inner">
          {loading && <p>Loading client...</p>}
          {error && <p className="error-text">{error}</p>}
          {client && (
            <>
              <h1>Client details</h1>
              <div className="detail-section">
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-item-label">Name</div>
                    <div className="detail-item-value">{client.name}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-item-label">Phone</div>
                    <div className="detail-item-value">{client.phone}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-item-label">Email</div>
                    <div className="detail-item-value">{client.email}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-item-label">Address</div>
                    <div className="detail-item-value">{client.address}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-item-label">CNI</div>
                    <div className="detail-item-value">{client.cniNumber}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-item-label">Branch</div>
                    <div className="detail-item-value">{client.branch}</div>
                  </div>
                </div>
              </div>
            </>
          )}
          {!loading && !client && !error && <p>No client found.</p>}

          <div style={{ marginTop: "24px" }}>
            <h2>Assurances</h2>

            {assurancesLoading && <p>Loading assurances...</p>}

            <button
              type="button"
              className="primary-button"
              onClick={startCreateAssurance}
              disabled={assurancesLoading}
            >
              Add assurance
            </button>

            {assurances.length > 0 ? (
              <table className="table" style={{ marginTop: 16 }}>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Policy</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assurances.map((assurance) => (
                    <tr key={assurance._id}>
                      <td>{assurance.type}</td>
                      <td>{assurance.policyNumber}</td>
                      <td>{assurance.startDate.slice(0, 10)}</td>
                      <td>{assurance.endDate.slice(0, 10)}</td>
                      <td>{assurance.amount}</td>
                      <td>{assurance.status}</td>
                      <td className="table-actions">
                        <button
                          type="button"
                          className="action-button action-button--edit"
                          onClick={() => startEditAssurance(assurance)}
                        >
                          <span className="action-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24">
                              <path d="M4 17.25V20h2.75L17.81 8.94l-2.75-2.75L4 17.25Zm13.71-9.46a1 1 0 0 0 0-1.41l-1.59-1.59a1 1 0 0 0-1.41 0l-1.13 1.13 2.75 2.75 1.38-1.38Z" />
                            </svg>
                          </span>
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="action-button action-button--delete"
                          onClick={() => handleAssuranceDelete(assurance._id)}
                        >
                          <span className="action-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24">
                              <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v8h-2V9Zm4 0h2v8h-2V9Z" />
                            </svg>
                          </span>
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              !assurancesLoading && <p>No assurances found.</p>
            )}
          </div>
        </div>
      </div>
      {isAssuranceModalOpen && assuranceForm && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>{editingAssuranceId ? "Edit assurance" : "Add assurance"}</h2>
            <form onSubmit={handleAssuranceSubmit}>
              <div className="modal-grid">
                <div className="modal-field">
                  <label>
                    Type
                    <input
                      name="type"
                      value={assuranceForm.type}
                      onChange={handleAssuranceInputChange}
                      required
                    />
                  </label>
                </div>
                <div className="modal-field">
                  <label>
                    Policy number
                    <input
                      name="policyNumber"
                      value={assuranceForm.policyNumber}
                      onChange={handleAssuranceInputChange}
                      required
                    />
                  </label>
                </div>
                <div className="modal-field">
                  <label>
                    Start date
                    <input
                      name="startDate"
                      type="date"
                      value={assuranceForm.startDate}
                      onChange={handleAssuranceInputChange}
                      required
                    />
                  </label>
                </div>
                <div className="modal-field">
                  <label>
                    End date
                    <input
                      name="endDate"
                      type="date"
                      value={assuranceForm.endDate}
                      onChange={handleAssuranceInputChange}
                      required
                    />
                  </label>
                </div>
                <div className="modal-field">
                  <label>
                    Amount
                    <input
                      name="amount"
                      type="number"
                      step="0.01"
                      value={assuranceForm.amount}
                      onChange={handleAssuranceInputChange}
                      required
                    />
                  </label>
                </div>
                <div className="modal-field">
                  <label>
                    Status
                    <select
                      name="status"
                      value={assuranceForm.status}
                      onChange={handleAssuranceInputChange}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeAssuranceModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={assurancesLoading}
                >
                  {assurancesLoading
                    ? "Saving..."
                    : editingAssuranceId
                      ? "Update assurance"
                      : "Create assurance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
};

export default ClientDetailsPage;
