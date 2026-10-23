import apiRequestFetch from "./fetchAPIrequest.js";

const adminName = document.getElementById("userName");
const totalUserCont = document.getElementById("totalUsers");
const tableBody = document.querySelector(".table-body");
const storedUser = localStorage.getItem("user");
const userData = storedUser ? JSON.parse(storedUser) : null;

// DELETE DIALOG ELEMENTS
const deleteDialog = document.getElementById("delete-user-dialog");
const cancelDeleteDialogBtn = document.getElementById("cancel-delete-button");
const delteDialogMessage = document.getElementById("delete-dialog-message");
const confirmDeleteDialogBtn = document.getElementById("confirm-delete-button");
let pendingDeletionId = null;
let pendingDeletionUserName = null;

// ROLE UPDATE ELEMENTS
const roleDialog = document.getElementById("update-role-dialog");
const roleUpdateDialogMsg = document.getElementById(
  "update-role-dialog-message",
);
const cancelRoleDialog = document.getElementById("cancel-update-button");
const confirmRoleDialog = document.getElementById("confirm-update-button");
let pendingRoleUpdateId = null;
let pendingRoleUpdateuserName = null;
let pendingNewRole = null;

// PERMISSION MANAGEMENT
const canManageRoles = userData?.role?.trim().toLowerCase() === "super-admin";
const currentUserRole = userData?.role?.trim().toLowerCase() || "";
const canManageDeletion =
  currentUserRole === "admin" || currentUserRole === "super-admin";

adminName.textContent =
  userData?.fullname?.split(" ").slice(0, 1).join(" ") || "admin";

//DISPLAY ALL USERS
const handleDisplayUsers = async () => {
  tableBody.replaceChildren();
  try {
    const data = await apiRequestFetch(`/`, {
      method: "GET",
      credentials: "include",
      headers: { "content-type": "application/json" },
    });
    const AllUsers = data?.data?.database;
    if (AllUsers.length === 0 || !AllUsers) {
      const emptyRow = document.createElement("tr");
      const emptyCell = document.createElement("td");

      emptyCell.colSpan = 5;
      emptyCell.textContent = "No users found";

      emptyRow.appendChild(emptyCell);
      tableBody.appendChild(emptyRow);
      return;
    }
    totalUserCont.textContent = AllUsers.length;

    function createTableRows() {
      AllUsers.forEach((eachUser) => {
        const madeTableRow = document.createElement("tr");
        const madeFullNameTd = document.createElement("td");
        const madeUserNameTd = document.createElement("td");
        const madeEmailTd = document.createElement("td");
        const madeRoleTd = document.createElement("td");
        const madeDeleteTd = document.createElement("td");
        const madeRoleTdSelect = document.createElement("select");
        const madeOptionStudent = document.createElement("option");
        const madeOptionAdmin = document.createElement("option");
        const madeOptionSuperAdmin = document.createElement("option");
        const madeDeleteBtn = document.createElement("button");

        madeFullNameTd.setAttribute("class", "fullname-td");
        madeUserNameTd.setAttribute("class", "username-td");
        madeEmailTd.setAttribute("class", "email-td");
        madeRoleTdSelect.setAttribute("class", "role-td");
        madeRoleTdSelect.setAttribute("id", "made-select-role-td");
        madeOptionStudent.setAttribute("value", "student");
        madeOptionAdmin.setAttribute("value", "admin");
        madeOptionSuperAdmin.setAttribute("value", "super-admin");
        madeDeleteBtn.setAttribute("type", "button");
        madeDeleteBtn.setAttribute("class", "delete-user-button");
        madeRoleTdSelect.disabled ? (style.cursor = "not-allowed") : null;
        madeDeleteBtn.disabled = true;
        // madeRoleTdSelect.disabled?.style.cursor = "not-allowed";
        madeOptionAdmin.text = "admin";
        madeOptionStudent.text = "student";
        madeOptionSuperAdmin.text = "super-admin";
        madeDeleteBtn.textContent = "Delete";
        String(eachUser?._id);
        madeTableRow.dataset.userId = eachUser?._id;
        madeTableRow.dataset.username = eachUser?.username;
        pendingDeletionId = madeTableRow.dataset.userId;
        pendingDeletionUserName = madeTableRow.dataset.username;

        // APPEND CHILDREN
        madeRoleTdSelect.append(
          madeOptionStudent,
          madeOptionAdmin,
          madeOptionSuperAdmin,
        );
        madeRoleTd.appendChild(madeRoleTdSelect);
        madeDeleteTd.appendChild(madeDeleteBtn);

        madeTableRow.append(
          madeFullNameTd,
          madeUserNameTd,
          madeEmailTd,
          madeRoleTd,
          madeDeleteTd,
        );

        tableBody.appendChild(madeTableRow);
        const role =
          typeof eachUser.role === "string"
            ? eachUser.role.trim().toLowerCase()
            : "";
        const isCurrentUser = userData?._id === eachUser?._id;

        madeFullNameTd.textContent = eachUser.fullname;
        madeUserNameTd.textContent = eachUser.username;
        madeEmailTd.textContent = eachUser.email;
        if (role === "student") {
          madeOptionStudent.text = role;
          madeOptionStudent.selected = true;
        } else if (role === "admin") {
          madeOptionAdmin.text = role;
          madeOptionAdmin.selected = true;
        } else if (role === "super-admin") {
          madeOptionSuperAdmin.text = role;
          madeOptionSuperAdmin.selected = true;
        } else {
          madeRoleTdSelect.style.display = "none";
        }

        madeRoleTdSelect.disabled = !canManageRoles || isCurrentUser;

        let canDeleteTarget = false;
        if (isCurrentUser) {
          canDeleteTarget = false;
        } else if (currentUserRole === "super-admin") {
          canDeleteTarget = true;
        } else if (currentUserRole === "admin" && role === "student") {
          canDeleteTarget = true;
        }
        madeDeleteBtn.disabled = !canDeleteTarget;
      });
    }

    createTableRows();
  } catch (error) {
    console.log(error);
  }
};

handleDisplayUsers();
// DELETE LOGIC
function handleDeleteDialog() {
  deleteDialog.showModal();
  document.body.style.overflow = "hidden";
}

tableBody.addEventListener("click", (e) => {
  const deleteButton = e.target.closest(".delete-user-button");
  if (!deleteButton) return;
  const row = deleteButton.closest("tr");
  pendingDeletionUserName = row?.dataset.username;
  pendingDeletionId = row?.dataset.userId;
  // deleteDialog.showModal();
  handleDeleteDialog();

  if (pendingDeletionUserName === null) return;
  delteDialogMessage.textContent = `Are you sure you want to delete ${pendingDeletionUserName}?`;
});

cancelDeleteDialogBtn.addEventListener("click", () => {
  deleteDialog.close();
  document.body.style.overflow = "auto";
});

async function handleDeleteUser() {
  if (pendingDeletionId === null) return;

  try {
    confirmDeleteDialogBtn.disabled = true;
    await apiRequestFetch(`/admin/delete/${pendingDeletionId}`, {
      method: "DELETE",
      credentials: "include",
    });
  } catch (error) {
    console.log(error);
    document.body.style.overflow = "auto";
  } finally {
    deleteDialog.close();
    document.body.style.overflow = "auto";
    confirmDeleteDialogBtn.disabled = false;
    pendingDeletionId = null;
    pendingDeletionUserName = null;
    await handleDisplayUsers();
  }
}

confirmDeleteDialogBtn.addEventListener("click", handleDeleteUser);

// role update logic
function handleRoleDialog() {
  roleDialog.showModal();
  document.body.style.overflow = "hidden";
}

tableBody.addEventListener("change", (event) => {
  const roleSelect = event.target.closest("#made-select-role-td");
  if (!roleSelect) return;
  const row = roleSelect.closest("tr");
  pendingRoleUpdateuserName = row?.dataset.username;
  pendingRoleUpdateId = row?.dataset.userId;
  handleRoleDialog();

  if (!pendingRoleUpdateId || !pendingRoleUpdateuserName) return;

  roleUpdateDialogMsg.textContent = `Are you sure you want to assign ${pendingRoleUpdateuserName} the ${roleSelect.value} role?`;
  pendingNewRole = roleSelect.value;
});

cancelRoleDialog.addEventListener("click", () => {
  roleDialog.close();
  document.body.style.overflow = "auto";
});

async function handleRoleUpdate() {
  if (pendingRoleUpdateId === null || pendingNewRole === null) return;

  try {
    confirmRoleDialog.disabled = true;
    await apiRequestFetch(`/admin/update/${pendingRoleUpdateId}/role`, {
      method: "PATCH",
      credentials: "include",
      body: JSON.stringify({ role: pendingNewRole }),
    });
  } catch (error) {
    console.error(error);
    document.body.style.overflow = "auto";
  } finally {
    confirmRoleDialog.disabled = false;
    roleDialog.close();
    document.body.style.overflow = "auto";
    await handleDisplayUsers();
    pendingRoleUpdateId = null;
    pendingRoleUpdateuserName = null;
  }
}

confirmRoleDialog.addEventListener("click", handleRoleUpdate);
