import React, { useState, useEffect } from "react";
import { Button, Alert } from "reactstrap";
import Highlight from "../components/Highlight";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getConfig } from "../config";
import Loading from "../components/Loading";
import jwt_decode from "jwt-decode";

export const PermissionGrant = () => {
  const { apiOrigin = "http://localhost:8000", audience } = getConfig();

  const [state, setState] = useState({
    showResult: false,
    showEditBox: false,
    permissionEditor: false,
    apiMessage: "",
    error: null,
  });

  const {
    getAccessTokenSilently,
    loginWithPopup,
    user,
    getAccessTokenWithPopup,
  } = useAuth0();


  const handleConsent = async () => {
    try {
      await getAccessTokenWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await getOrgs();
  };

  const handleLoginAgain = async () => {
    try {
      await loginWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await getOrgs();
  };

  const grantUserToOrg = async () => {

      var object1 = document.getElementById("user").value;
      var object2 = document.getElementById("org").value;
      var relation = document.getElementById("permission").value;
      object2 = "org:" + object2;

          console.log("user to org");
          console.log(object1);
          console.log(object2);
          console.log(relation);

        try {
          const token = await getAccessTokenSilently();
          await fetch(`${apiOrigin}/permission?object1=${object1}&object2=${object2}&relation=${relation}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

      } catch (error) {
      console.log(error);
        setState({
          ...state,
          error: error.error,
        });
      }
      };



    const addUserToGroup = async () => {

        var object1 = document.getElementById("user").value;
        var object2 = document.getElementById("groupName").value;
        var relation = "member";
        object2 = "group:" + object2;

        console.log("user to group");
        console.log(object1);
        console.log(object2);
        console.log(relation);

          try {
            const token = await getAccessTokenSilently();
            await fetch(`${apiOrigin}/permission?object1=${object1}&object2=${object2}&relation=${relation}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

        } catch (error) {
        console.log(error);
          setState({
            ...state,
            error: error.error,
          });
        }
        };


    const addOrgToFranchise = async () => {

        var object1 = document.getElementById("orgGroupName").value;
        var object2 = document.getElementById("org").value;
        var relation = "parent";
        object2 = "org:" + object2;
        object1 = "org_group:" + object1;

            console.log("org to franchise");
            console.log(object1);
            console.log(object2);
            console.log(relation);

          try {
            const token = await getAccessTokenSilently();
            await fetch(`${apiOrigin}/permission?object1=${object1}&object2=${object2}&relation=${relation}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

        } catch (error) {
        console.log(error);
          setState({
            ...state,
            error: error.error,
          });
        }
        };

    const grantUserToFranchise = async () => {

        var object1 = document.getElementById("user").value;
        var object2 = document.getElementById("orgGroupName").value;
        var relation = document.getElementById("permission").value;
        object2 = "org_group:" + object2;

            console.log("user to franchise");
            console.log(object1);
            console.log(object2);
            console.log(relation);

          try {
            const token = await getAccessTokenSilently();
            await fetch(`${apiOrigin}/permission?object1=${object1}&object2=${object2}&relation=${relation}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });


        } catch (error) {
        console.log(error);
          setState({
            ...state,
            error: error.error,
          });
        }
        };

    const grantGroupToFranchise = async () => {

        var object1 = document.getElementById("groupName").value;
        var object2 = document.getElementById("orgGroupName").value;
        var relation = document.getElementById("permission").value;
        object1 = "group:" + object1+"%23member";
        object2 = "org_group:" + object2;

            console.log("group to franchise");
            console.log(object1);
            console.log(object2);
            console.log(relation);

          try {
            const token = await getAccessTokenSilently();
            await fetch(`${apiOrigin}/permission?object1=${object1}&object2=${object2}&relation=${relation}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

        } catch (error) {
        console.log(error);
          setState({
            ...state,
            error: error.error,
          });
        }
        };

    const grantGroupToOrg = async () => {

        var object1 = document.getElementById("groupName").value;
        var object2 = document.getElementById("org").value;
        var relation = document.getElementById("permission").value;
        object1 = "group:" + object1+"%23member";
        object2 = "org:" + object2;

            console.log("group to org");
            console.log(object1);
            console.log(object2);
            console.log(relation);

          try {
            const token = await getAccessTokenSilently();
            await fetch(`${apiOrigin}/permission?object1=${object1}&object2=${object2}&relation=${relation}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

        } catch (error) {
        console.log(error);
          setState({
            ...state,
            error: error.error,
          });
        }
        };


  const getOrgs = async () => {
    try {
      const token = await getAccessTokenSilently();
      var authToken = jwt_decode(token);
      var permissionEditor = false;
      if (authToken.permissions.includes("add:permissions")) {
        permissionEditor = true;
      }

      const response = await fetch(`${apiOrigin}/organisations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();

      var orgsData = [];
      for (var k = 0; k < responseData.length; k++) {
          orgsData.push(<option key={responseData[k].id} value={responseData[k].id}> {responseData[k].name} </option>);
      }

      const moreResponse = await fetch(`${apiOrigin}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const moreResponseData = await moreResponse.json();

      var usersData = [];
      for (var l = 0; l < moreResponseData.length; l++) {
          usersData.push(<option key={moreResponseData[l].user_id} value={moreResponseData[l].user_id}> {moreResponseData[l].email} </option>);
      }


      setState({
        ...state,
        opts: orgsData,
        userOpts: usersData,
        permissionEditor: permissionEditor,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

  };


  useEffect(() => {
   getOrgs();
  }, []);


  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  return (
    <>
      <div className="mb-5">
        {state.error === "consent_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              class="alert-link"
              onClick={(e) => handle(e, handleConsent)}
            >
              consent to get access to users api
            </a>
          </Alert>
        )}

        {state.error === "login_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              class="alert-link"
              onClick={(e) => handle(e, handleLoginAgain)}
            >
              log in again
            </a>
          </Alert>
        )}

        <h1>Permissions Editor</h1>
        <p className="lead">
          For granting permissions to modify organisations.
        </p>

        <h2>{user.sub}</h2>

        {!state.permissionEditor && (
        <p>You do not have permission to edit permissions</p>
        )}

        {state.permissionEditor && (
        <label>Org
          <select id='org'>
            {state.opts}
          </select>
          </label>
          )}

        <br></br>
        {state.permissionEditor && (
          <label>User
        <select id='user'>
          {state.userOpts}
        </select>
        </label>
        )}

        <br></br>

        {state.permissionEditor && (
        <label>Permission
        <select name="permission" id="permission">
          <option value="owner">Owner</option>
          <option value="viewer">Viewer</option>
        </select>
        </label>
        )}

        <br></br>

        {state.permissionEditor && (
        <label>Group Name
        <input name="groupName" id="groupName"></input>
        </label>
        )}

        <br></br>

        {state.permissionEditor && (
        <label>Org group name
        <input name="orgGroupName" id="orgGroupName"></input>
        </label>
        )}

        <br></br>

        {state.permissionEditor && (
        <Button
          color="primary"
          className="mt-5"
          onClick={grantUserToOrg}
          disabled={!audience}
        >
          Grant user to Org
        </Button>
        )}

        <br></br>

        {state.permissionEditor && (
        <Button
          color="primary"
          className="mt-5"
          onClick={addUserToGroup}
          disabled={!audience}
        >
          Add user to Group
        </Button>
        )}

        <br></br>

        {state.permissionEditor && (
        <Button
          color="primary"
          className="mt-5"
          onClick={addOrgToFranchise}
          disabled={!audience}
        >
          Add Org to Franchise/Group
        </Button>
        )}

        <br></br>

        {state.permissionEditor && (
        <Button
          color="primary"
          className="mt-5"
          onClick={grantUserToFranchise}
          disabled={!audience}
        >
          Grant user to Org Franchise/Group
        </Button>
        )}

        <br></br>

        {state.permissionEditor && (
        <Button
          color="primary"
          className="mt-5"
          onClick={grantGroupToFranchise}
          disabled={!audience}
        >
          Grant user group to Org Franchise/Group
        </Button>
        )}

        <br></br>

        {state.permissionEditor && (
        <Button
          color="primary"
          className="mt-5"
          onClick={grantGroupToOrg}
          disabled={!audience}
        >
          Grant user group to Org
        </Button>
        )}





      </div>


      <div className="result-block-container">
        {state.showResult && (
          <div className="result-block" data-testid="api-result">
            <h6 className="muted">Result</h6>
            <Highlight>
              <span>{JSON.stringify(state.apiMessage, null, 2)}</span>
            </Highlight>
            <br></br>

          </div>
        )}

      </div>
    </>
  );
};

export default withAuthenticationRequired(PermissionGrant, {
  onRedirecting: () => <Loading />,
  loginOptions: { maxAge: 60 }
});
