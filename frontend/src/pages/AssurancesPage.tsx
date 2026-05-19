import React, { useEffect, useState } from "react";
import SidebarLayout from "../components/SidebarLayout";
import { useAppSelector } from "../store/hooks";
import {
  fetchAssurances,
  type AssuranceDto,
} from "../services/assurance.service";
import { useNavigate } from "react-router-dom";

const AssurancesPage: React.FC = () => {
  const auth = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [assurances, setAssurances] = useState<AssuranceDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAssurances() {
      if (!auth.token) return;
      try {
        setLoading(true);
        setError(null);
        const result = await fetchAssurances({ token: auth.token });
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
        setLoading(false);
      }
    }

    loadAssurances();
  }, [auth.token]);

  return (
    <SidebarLayout>
      <div className="dashboard-container">
        <div className="dashboard-inner">
          <h1>Assurances</h1>
          {error && <p className="error-text">{error}</p>}
          {loading && !assurances.length && <p>Loading assurances...</p>}

          {assurances.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Client</th>
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
                    <td>{assurance.client.name}</td>
                    <td>{assurance.type}</td>
                    <td>{assurance.policyNumber}</td>
                    <td>{assurance.startDate.slice(0, 10)}</td>
                    <td>{assurance.endDate.slice(0, 10)}</td>
                    <td>{assurance.amount}</td>
                    <td>{assurance.status}</td>
                    <td className="table-actions">
                      <button
                        type="button"
                        className="action-button action-button--view"
                        onClick={() =>
                          navigate(`/clients/${assurance.client._id}`)
                        }
                      >
                        <span className="action-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="M12 5C7 5 3.1 8.1 2 12c1.1 3.9 5 7 10 7s8.9-3.1 10-7c-1.1-3.9-5-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
                          </svg>
                        </span>
                        <span>View client</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            !loading && <p>No assurances found.</p>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default AssurancesPage;
