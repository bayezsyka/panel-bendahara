import { v4 as uuidv4 } from "uuid";

import React, { useState, useContext } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import BendaharaLayout from "@/Layouts/BendaharaLayout";
import PageHeader from "@/Components/PageHeader";
import Dropdown, { DropDownContext } from "@/Components/Dropdown";
import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import InputError from "@/Components/InputError";
import Swal from "sweetalert2";
import { SearchInput } from "@/Components/ui";

const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(number);
};

const SelectedProjectExportActions = ({ project, expenseTypes }) => {
    const { setOpen } = useContext(DropDownContext);
    const [selectedType, setSelectedType] = useState("");

    const onExportAll = () => {
        window.open(
            route("projectexpense.projects.export", {
                project: project.slug || project.id,
            }),
            "_blank",
        );
        setOpen(false);
    };

    const onExportByType = () => {
        if (!selectedType) {
            alert("Pilih tipe biaya terlebih dahulu");
            return;
        }
        window.open(
            route("projectexpense.projects.export", {
                project: project.slug || project.id,
                expense_type_id: selectedType,
            }),
            "_blank",
        );
        setOpen(false);
    };

    return (
        <Dropdown.Content closeOnClick={false} width="64">
            <div className="block px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Export Laporan
            </div>
            <Dropdown.Link
                as="button"
                onClick={onExportAll}
                className="w-full text-left"
            >
                PDF (Semua Kategori)
            </Dropdown.Link>

            <div className="border-t border-gray-100 my-1"></div>

            <div className="px-4 py-3 space-y-3">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Export Per Tipe Biaya
                </label>
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="block w-full rounded-lg border-gray-200 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                >
                    <option value="">Pilih Tipe Biaya</option>
                    {expenseTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                        </option>
                    ))}
                </select>
                <button
                    onClick={onExportByType}
                    className="w-full inline-flex justify-center items-center rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition-colors"
                >
                    <svg
                        className="w-3 h-3 mr-1.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    Export Tipe Biaya
                </button>
            </div>
        </Dropdown.Content>
    );
};

export default function Show({ project, mandors, benderas, expenseTypes, allExpenseTypes }) {
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(null);
    const [sortBy, setSortBy] = useState("transacted_at");
    const [search, setSearch] = useState("");

    const isCompleted = project.status === "completed";
    const totalExpense = project.expenses.reduce(
        (acc, curr) => acc + parseFloat(curr.amount),
        0,
    );

    const { data, setData, post, processing, errors, reset } = useForm({
        project_id: project.id,
        expense_type_id: "",
        title: "",
        transacted_at: new Date().toISOString().split("T")[0],
        description: "",
        receipt_image: null,
        items: [{ name: "", quantity: 1, price: 0 }],
        idempotency_key: uuidv4(),
    });

    // State to track if title is manually edited
    const [isTitleTouched, setIsTitleTouched] = useState(false);

    const currentTotal = data.items.reduce(
        (acc, item) => acc + item.quantity * item.price,
        0,
    );

    const editForm = useForm({
        name: project.name,
        description: project.description || "",
        status: project.status,
        coordinates: project.coordinates || "",
        mandor_id: project.mandor_id || "",
        mandor_ids: project.mandors
            ? project.mandors.map((m) => m.id)
            : project.mandor_id
              ? [project.mandor_id]
              : [],
        bendera_id: project.bendera_id || "",
        location: project.location || "",
    });

    const filteredExpenses = project.expenses
        .filter((expense) => {
            const searchLower = search.toLowerCase();
            return (
                expense.title?.toLowerCase().includes(searchLower) ||
                expense.description?.toLowerCase().includes(searchLower) ||
                expense.expense_type?.name?.toLowerCase().includes(searchLower) ||
                (expense.items &&
                    expense.items.some((item) =>
                        item.name?.toLowerCase().includes(searchLower),
                    ))
            );
        })
        .sort((a, b) => {
            const dateA = new Date(a[sortBy]);
            const dateB = new Date(b[sortBy]);
            return dateB - dateA;
        });

    const [editingExpenseId, setEditingExpenseId] = useState(null);

    // Effect to auto-fill title from first item
    const firstItemName = data.items.length > 0 ? data.items[0].name : "";
    React.useEffect(() => {
        if (!isTitleTouched && !editingExpenseId && firstItemName) {
            setData("title", firstItemName);
        }
    }, [firstItemName, isTitleTouched, editingExpenseId]);

    const handleAddItem = () => {
        setData("items", [...data.items, { name: "", quantity: 1, price: 0 }]);
    };

    const handleRemoveItem = (index) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData("items", newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        setData("items", newItems);
    };

    const openCreateExpenseModal = () => {
        setEditingExpenseId(null);
        setData({
            project_id: project.id,
            expense_type_id: "",
            title: "",
            transacted_at: new Date().toISOString().split("T")[0],
            description: "",
            receipt_image: null,
            items: [{ name: "", quantity: 1, price: 0 }],
            idempotency_key: uuidv4(),
        });

        setIsTitleTouched(false);
        setShowExpenseModal(true);
    };

    const openEditExpenseModal = (expense) => {
        setEditingExpenseId(expense.id);
        setData({
            project_id: project.id,
            expense_type_id: expense.expense_type_id || "",
            title: expense.title,
            transacted_at: expense.transacted_at, // Assumes YYYY-MM-DD from backend or cast
            description: expense.description || "",
            receipt_image: null, // Don't prepopulate file input, handled by backend if null
            items: expense.items.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
            })),
        });

        setIsTitleTouched(true);
        setShowExpenseModal(true);
    };

    const submitExpense = (e) => {
        e.preventDefault();

        if (editingExpenseId) {
            // Edit Mode
            router.post(
                route("projectexpense.expenses.update", editingExpenseId),
                {
                    _method: "put",
                    ...data,
                },
                {
                    onSuccess: () => {
                        setShowExpenseModal(false);
                        reset();
                        setEditingExpenseId(null);
                    },
                    preserveScroll: true,
                    forceFormData: true,
                },
            );
        } else {
            // Create Mode
            post(route("projectexpense.expenses.store"), {
                onSuccess: () => {
                    setShowExpenseModal(false);
                    reset();
                    // Generate new key
                    setData((data) => ({ ...data, idempotency_key: uuidv4() }));
                },
                forceFormData: true,
            });
        }
    };

    const submitEditProject = (e) => {
        e.preventDefault();
        editForm.put(
            route("projectexpense.projects.update", project.slug || project.id),
            {
                onSuccess: () => setShowEditModal(false),
            },
        );
    };

    const handleDeleteExpense = (id) => {
        Swal.fire({
            title: "Hapus Pengeluaran?",
            text: "Data pengeluaran ini akan dihapus permanen.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("projectexpense.expenses.destroy", id));
            }
        });
    };

    const handleDeleteProject = () => {
        Swal.fire({
            title: "Hapus Proyek?",
            html: `<p class="text-gray-600">Proyek <strong>${project.name}</strong> beserta seluruh data pengeluaran akan dihapus permanen.</p>`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, Hapus Proyek",
            cancelButtonText: "Batal",
            customClass: {
                popup: "rounded-xl",
                confirmButton: "rounded-lg",
                cancelButton: "rounded-lg",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(
                    route(
                        "projectexpense.projects.destroy",
                        project.slug || project.id,
                    ),
                );
            }
        });
    };

    return (
        <BendaharaLayout>
            <Head title={`Proyek: ${project.name}`} />

            <PageHeader
                title={project.name}
                backLink={route("projectexpense.projects.index")}
                backLabel="Daftar Proyek"
                badge={{
                    text: isCompleted ? "Selesai" : "Berjalan",
                    variant: isCompleted ? "green" : "blue",
                }}
                meta={
                    <div className="flex flex-col gap-1 mt-1">
                        {project.bendera && (
                            <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-purple-100 text-purple-700 w-fit">
                                🏢 {project.bendera.name}
                            </div>
                        )}
                        {/* Tampilkan multiple mandors */}
                        {project.mandors && project.mandors.length > 0 ? (
                            <div className="space-y-1">
                                {project.mandors.map((mandor, idx) => (
                                    <div
                                        key={mandor.id}
                                        className="flex items-center gap-2 text-sm text-gray-600"
                                    >
                                        <svg
                                            className="w-4 h-4 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                        Pelaksana {idx + 1}:{" "}
                                        <span className="font-medium text-gray-900">
                                            {mandor.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            project.mandor && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <svg
                                        className="w-4 h-4 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                    Pelaksana:{" "}
                                    <span className="font-medium text-gray-900">
                                        {project.mandor.name}
                                    </span>
                                </div>
                            )
                        )}
                        {project.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <svg
                                    className="w-4 h-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                {project.location}
                            </div>
                        )}
                    </div>
                }
                actions={
                    <div className="flex items-center gap-2">
                        {/* Edit Button */}
                        {!isCompleted && (
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                title="Edit Proyek"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                </svg>
                            </button>
                        )}

                        {/* Delete Button */}
                        <button
                            onClick={handleDeleteProject}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus Proyek"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </button>

                        <div className="w-px h-6 bg-gray-200 mx-1"></div>

                        {/* Export Dropdown */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 shadow-sm text-sm"
                                >
                                    <svg
                                        className="w-4 h-4 text-red-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    Export
                                    <svg
                                        className="ml-1 h-4 w-4 text-gray-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>
                            <SelectedProjectExportActions
                                project={project}
                                expenseTypes={expenseTypes}
                            />
                        </Dropdown>

                        {/* Add Expense Button */}
                        {!isCompleted ? (
                            <button
                                onClick={openCreateExpenseModal}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm text-sm"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                Catat Pengeluaran
                            </button>
                        ) : (
                            <div className="px-3 py-2 bg-gray-100 text-gray-500 font-medium rounded-lg border border-gray-200 cursor-not-allowed text-sm">
                                Terkunci
                            </div>
                        )}
                    </div>
                }
            />

            {/* Project Description & Map */}
            {(project.description || project.coordinates) && (
                <div className="mb-6 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    {project.description && (
                        <p className="text-gray-600 mb-4">
                            {project.description}
                        </p>
                    )}
                    {project.coordinates && (
                        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
                            <iframe
                                width="100%"
                                height="200"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight="0"
                                marginWidth="0"
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(project.coordinates)}&hl=id&z=14&output=embed`}
                            ></iframe>
                            <div className="p-2 bg-white flex justify-between items-center text-sm">
                                <span className="text-gray-500 truncate max-w-[200px]">
                                    {project.coordinates}
                                </span>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.coordinates)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-indigo-600 font-medium hover:underline"
                                >
                                    Buka di Maps →
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-gray-500 text-sm font-medium">
                        Total Pengeluaran
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                        {formatRupiah(totalExpense)}
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-gray-500 text-sm font-medium">
                        Jumlah Transaksi
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                        {project.expenses.length} Nota
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-gray-500 text-sm font-medium">
                        Terakhir Update
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                        {project.expenses.length > 0
                            ? new Date(
                                  project.expenses[0].transacted_at,
                              ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                              })
                            : "-"}
                    </div>
                </div>
            </div>

            {/* Expense Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-gray-200 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            Riwayat Pengeluaran
                        </h3>
                        <p className="text-sm text-gray-500">
                            Kelola dan pantau semua transaksi proyek
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            placeholder="Cari nota, barang..."
                            className="w-full sm:w-64"
                        />

                        <div className="flex items-center gap-2">
                            <select
                                value={
                                    new URLSearchParams(
                                        window.location.search,
                                    ).get("expense_type_id") || ""
                                }
                                onChange={(e) => {
                                    const params = new URLSearchParams(
                                        window.location.search,
                                    );
                                    if (e.target.value) {
                                        params.set(
                                            "expense_type_id",
                                            e.target.value,
                                        );
                                    } else {
                                        params.delete("expense_type_id");
                                    }
                                    router.get(
                                        `${window.location.pathname}?${params.toString()}`,
                                        {},
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                        },
                                    );
                                }}
                                className="flex-1 sm:w-44 text-sm border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm py-2.5 bg-white"
                            >
                                <option value="">Semua Tipe</option>
                                {expenseTypes &&
                                    expenseTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                            </select>

                            <div className="flex bg-gray-100 p-1 rounded-lg h-[45px] items-center">
                                <button
                                    onClick={() => setSortBy("transacted_at")}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition whitespace-nowrap ${
                                        sortBy === "transacted_at"
                                            ? "bg-white text-indigo-700 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    Nota
                                </button>
                                <button
                                    onClick={() => setSortBy("created_at")}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition whitespace-nowrap ${
                                        sortBy === "created_at"
                                            ? "bg-white text-indigo-700 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    Input
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tanggal
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipe Biaya
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Detail
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bukti
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredExpenses.length > 0 ? (
                                filteredExpenses.map((expense) => (
                                    <tr
                                        key={expense.id}
                                        className="hover:bg-gray-50 transition"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 align-top">
                                            <div className="font-semibold text-gray-900">
                                                {new Date(
                                                    expense[sortBy],
                                                ).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm align-top">
                                            {expense.expense_type ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                    {expense.expense_type.name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="font-bold text-indigo-700 mb-1">
                                                {expense.title}
                                            </div>

                                            {expense.items &&
                                            expense.items.length > 0 ? (
                                                <ul className="text-sm text-gray-700 bg-gray-50 rounded-md p-2 space-y-1 border border-gray-100">
                                                    {expense.items.map(
                                                        (item, idx) => (
                                                            <li
                                                                key={
                                                                    item.id ||
                                                                    idx
                                                                }
                                                                className="flex justify-between items-center border-b border-gray-100 last:border-0 pb-1 last:pb-0"
                                                            >
                                                                <span className="flex-1">
                                                                    <span className="font-medium">
                                                                        {item.name}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500 ml-1">
                                                                        (
                                                                        {
                                                                            item.quantity
                                                                        }{" "}
                                                                        x{" "}
                                                                        {formatRupiah(
                                                                            item.price,
                                                                        )}
                                                                        )
                                                                    </span>
                                                                </span>
                                                                <span className="font-medium text-gray-900 ml-4">
                                                                    {formatRupiah(
                                                                        item.total_price,
                                                                    )}
                                                                </span>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            ) : (
                                                <div className="text-sm text-gray-500 italic">
                                                    Tidak ada detail item.
                                                </div>
                                            )}

                                            {expense.description && (
                                                <div className="text-xs text-gray-500 mt-2 italic">
                                                    "{expense.description}"
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center align-top">
                                            {expense.receipt_image ? (
                                                <button
                                                    onClick={() =>
                                                        setShowImageModal(
                                                            `/storage/${expense.receipt_image}`,
                                                        )
                                                    }
                                                    className="text-indigo-600 hover:text-indigo-900 text-xs font-medium underline border border-indigo-200 rounded px-2 py-1 bg-indigo-50"
                                                >
                                                    Lihat Foto
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900 align-top">
                                            {formatRupiah(expense.amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-top">
                                            {!isCompleted && (
                                                <div className="flex flex-col gap-2 align-end">
                                                    <button
                                                        onClick={() =>
                                                            openEditExpenseModal(
                                                                expense,
                                                            )
                                                        }
                                                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 text-xs text-center"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteExpense(
                                                                expense.id,
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded hover:bg-red-100 text-xs text-center"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-12 text-center text-gray-500"
                                    >
                                        {project.expenses.length > 0
                                            ? "Tidak ada data pengeluaran yang cocok dengan pencarian."
                                            : "Belum ada pengeluaran tercatat."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Edit Proyek */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="3xl">
                <form onSubmit={submitEditProject} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                        Edit Data Proyek
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div>
                                <InputLabel value="Nama Proyek" />
                                <TextInput
                                    value={editForm.data.name}
                                    onChange={(e) =>
                                        editForm.setData("name", e.target.value)
                                    }
                                    className="mt-1 block w-full"
                                    required
                                />
                                <InputError
                                    message={editForm.errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel value="Bendera (PT/CV)" />
                                <select
                                    value={editForm.data.bendera_id}
                                    onChange={(e) =>
                                        editForm.setData(
                                            "bendera_id",
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                >
                                    <option value="">-- Pilih Bendera --</option>
                                    {benderas.map((bendera) => (
                                        <option key={bendera.id} value={bendera.id}>
                                            {bendera.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={editForm.errors.bendera_id}
                                    className="mt-2"
                                />
                            </div>

                             <div>
                                <InputLabel value="Status" />
                                <select
                                    value={editForm.data.status}
                                    onChange={(e) =>
                                        editForm.setData("status", e.target.value)
                                    }
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                >
                                    <option value="ongoing">Sedang Berjalan</option>
                                    <option value="completed">Selesai</option>
                                </select>
                            </div>

                            <div>
                                <InputLabel value="Lokasi Proyek" />
                                <TextInput
                                    value={editForm.data.location}
                                    onChange={(e) =>
                                        editForm.setData("location", e.target.value)
                                    }
                                    className="mt-1 block w-full"
                                    placeholder="Jl. Sudirman No. 45"
                                />
                                <InputError
                                    message={editForm.errors.location}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div>
                                <InputLabel value="Pelaksana (Multi-select)" />
                                <div className="mt-1 border border-gray-300 rounded-md p-2 max-h-40 overflow-y-auto bg-gray-50">
                                    {mandors.map((mandor) => (
                                        <label
                                            key={mandor.id}
                                            className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={editForm.data.mandor_ids.includes(
                                                    mandor.id,
                                                )}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        editForm.setData("mandor_ids", [
                                                            ...editForm.data.mandor_ids,
                                                            mandor.id,
                                                        ]);
                                                    } else {
                                                        editForm.setData(
                                                            "mandor_ids",
                                                            editForm.data.mandor_ids.filter(
                                                                (id) =>
                                                                    id !== mandor.id,
                                                            ),
                                                        );
                                                    }
                                                }}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-gray-700">
                                                {mandor.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <InputError
                                    message={editForm.errors.mandor_ids}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel value="Koordinat Maps" />
                                <TextInput
                                    value={editForm.data.coordinates}
                                    onChange={(e) =>
                                        editForm.setData("coordinates", e.target.value)
                                    }
                                    className="mt-1 block w-full"
                                    placeholder={"6°52'09.6\"S 109°02'34.5\"E"}
                                />
                                <InputError
                                    message={editForm.errors.coordinates}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel value="Deskripsi" />
                                <textarea
                                    value={editForm.data.description}
                                    onChange={(e) =>
                                        editForm.setData("description", e.target.value)
                                    }
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                    rows="3"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton
                            onClick={() => setShowEditModal(false)}
                        >
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={editForm.processing}>
                            {editForm.processing
                                ? "Menyimpan..."
                                : "Simpan Perubahan"}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal Catat Pengeluaran */}
            <Modal
                show={showExpenseModal}
                onClose={() => setShowExpenseModal(false)}
                maxWidth="4xl"
            >
                <form
                    onSubmit={submitExpense}
                    className="p-6 max-h-[90vh] overflow-y-auto"
                >
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                        {editingExpenseId
                            ? "Edit Pengeluaran"
                            : "Catat Pengeluaran Baru"}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <InputLabel value="Judul Nota / Toko" />
                            <TextInput
                                value={data.title}
                                onChange={(e) => {
                                    setData("title", e.target.value);
                                    setIsTitleTouched(true);
                                }}
                                className="mt-1 block w-full"
                                placeholder="Cth: TB. Sinar Jaya"
                            />
                            <InputError
                                message={errors.title}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <InputLabel value="Tipe Biaya" />
                            <select
                                value={data.expense_type_id}
                                onChange={(e) =>
                                    setData("expense_type_id", e.target.value)
                                }
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                required
                            >
                                <option value="">-- Pilih Tipe Biaya --</option>
                                {allExpenseTypes &&
                                    allExpenseTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                            </select>
                            <InputError
                                message={errors.expense_type_id}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <InputLabel value="Tanggal Transaksi" />
                            <TextInput
                                type="date"
                                value={data.transacted_at}
                                onChange={(e) =>
                                    setData("transacted_at", e.target.value)
                                }
                                className="mt-1 block w-full"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <InputLabel value="Daftar Barang" />
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 font-medium border border-indigo-200"
                            >
                                + Tambah Item
                            </button>
                        </div>

                        <div className="space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            {data.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-white p-2 rounded shadow-sm"
                                >
                                    <div className="flex-1 w-full">
                                        <TextInput
                                            placeholder="Nama Barang"
                                            value={item.name}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    index,
                                                    "name",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="w-20">
                                        <TextInput
                                            type="number"
                                            placeholder="Qty"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    index,
                                                    "quantity",
                                                    parseInt(e.target.value) ||
                                                        0,
                                                )
                                            }
                                            className="w-full text-sm text-center"
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <div className="w-32">
                                        <TextInput
                                            type="number"
                                            placeholder="Harga @"
                                            value={item.price}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    index,
                                                    "price",
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                                )
                                            }
                                            className="w-full text-sm text-right"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div className="w-32 text-right text-sm font-semibold text-gray-700 px-2">
                                        {formatRupiah(
                                            item.quantity * item.price,
                                        )}
                                    </div>
                                    {data.items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveItem(index)
                                            }
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {errors.items && (
                            <div className="text-red-600 text-sm mt-1">
                                {errors.items}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-lg border border-indigo-100 mb-4">
                        <span className="font-semibold text-indigo-900">
                            Total Nota
                        </span>
                        <span className="text-xl font-bold text-indigo-700">
                            {formatRupiah(currentTotal)}
                        </span>
                    </div>

                    <div className="mb-4">
                        <InputLabel value="Foto Struk (Opsional)" />
                        {editingExpenseId && !data.receipt_image && (
                            <p className="text-xs text-gray-500 mb-1 italic">
                                *Biarkan kosong jika tidak ingin mengubah foto
                            </p>
                        )}
                        <input
                            type="file"
                            onChange={(e) =>
                                setData("receipt_image", e.target.files[0])
                            }
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            accept="image/*"
                        />
                    </div>

                    <div className="mb-6">
                        <InputLabel value="Catatan Tambahan (Opsional)" />
                        <textarea
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                            rows="2"
                            placeholder="Keterangan lain jika diperlukan..."
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 sticky bottom-0 bg-white pt-4 border-t border-gray-100">
                        <SecondaryButton
                            onClick={() => setShowExpenseModal(false)}
                        >
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {processing
                                ? "Menyimpan..."
                                : editingExpenseId
                                  ? "Simpan Perubahan"
                                  : "Simpan Pengeluaran"}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal Lihat Gambar */}
            <Modal
                show={!!showImageModal}
                onClose={() => setShowImageModal(null)}
            >
                <div className="p-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2">
                        <h3 className="font-medium">Bukti Transaksi</h3>
                        <button
                            type="button"
                            onClick={() => setShowImageModal(null)}
                            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                        >
                            ×
                        </button>
                    </div>
                    {showImageModal && (
                        <img
                            src={showImageModal}
                            alt="Struk"
                            className="w-full h-auto max-h-[75vh] object-contain rounded-lg border border-gray-200"
                        />
                    )}
                    <div className="mt-4 text-right">
                        <SecondaryButton
                            onClick={() => setShowImageModal(null)}
                        >
                            Tutup
                        </SecondaryButton>
                    </div>
                </div>
            </Modal>
        </BendaharaLayout>
    );
}
