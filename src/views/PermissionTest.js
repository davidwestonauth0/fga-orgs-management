import React, { useState, useEffect } from "react";
import { Button, Alert } from "reactstrap";
import Highlight from "../components/Highlight";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getConfig } from "../config";
import Loading from "../components/Loading";
import jwt_decode from "jwt-decode";

export const PermissionTestComponent = () => {
  const { apiOrigin = "http://localhost:8000", audience } = getConfig();

  const [state, setState] = useState({
    showResult: false,
    showEditBox: false,
    permissionTester: false,
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

  const getOrgs = async () => {
    try {
      const token = await getAccessTokenSilently();
    var authToken = jwt_decode(token);
    var permissionTester = false;
    if (authToken.permissions.includes("test:permissions")) {
      permissionTester = true;
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

      setState({
        ...state,
        opts: orgsData,
        permissionTester: permissionTester,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }
  };

    const readOrg = async () => {

       setState({
         ...state,
         showResult: false,
         apiMessage: "",
       });
      try {
        const token = await getAccessTokenSilently();
        const org = document.getElementById("org").value;

        const response = await fetch(`${apiOrigin}/organisation?org=${org}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(response);

        if (response.status === 200) {

            const responseData = await response.json();
            console.log(responseData);

              setState({
                ...state,
                showResult: true,
                apiMessage: responseData,
              });

        } else {
              setState({
                ...state,
                showResult: true,
                apiMessage: "You are not authorized to read this organization",
              });
        }


    } catch (error) {
    console.log(error);
      setState({
        ...state,
        error: error.error,
      });
    }
    };

    const updateOrg = async () => {

      try {
        const token = await getAccessTokenSilently();
        const org = document.getElementById("org").value;
        const orgData = document.getElementById("jsonContent").value;
        console.log(JSON.stringify(orgData));
               setState({
                 ...state,
                 showResult: false,
                 apiMessage: "",
               });

        const response = await fetch(`${apiOrigin}/organisation?org=${org}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: orgData
        });
        console.log(response);

        if (response.status === 200) {

            const responseData = await response.json();
            console.log(responseData);

              setState({
                ...state,
                showResult: true,
                apiMessage: responseData,
              });

        } else {
              setState({
                ...state,
                showResult: true,
                apiMessage: "You are not authorized to write this organization",
              });
        }


    } catch (error) {
    console.log(error);
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

        <h1>Organisations Editor</h1>
        <p className="lead">
          For testing permissions to modify organisations.
        </p>

        <h2>{user.sub}</h2>

        {!state.permissionTester && (
        <p>You do not have permission to modify organisations</p>
        )}

{state.permissionTester && (
          <select id='org'>
            {state.opts}
          </select>
          )}

        <br></br>
         {state.permissionTester && (
        <Button
          color="primary"
          className="mt-5"
          onClick={readOrg}
          disabled={!audience}
        >
          Read Org
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
<textarea id="jsonContent" rows="8" cols="100"></textarea>
<br></br>
            <Button
              color="primary"
              className="mt-5"
              onClick={updateOrg}
              disabled={!audience}
            >
              Update Org
            </Button>
          </div>
        )}

      </div>
    </>
  );
};

export default withAuthenticationRequired(PermissionTestComponent, {
  onRedirecting: () => <Loading />,
  loginOptions: { maxAge: 60 }
});
