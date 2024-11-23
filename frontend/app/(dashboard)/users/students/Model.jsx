"use client";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentRegister } from "@/utils/apiRequests/auth.api";
import { getStudentById, updateStudent } from "@/utils/apiRequests/user.api";
import { GiCancel } from "react-icons/gi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAllFaculties,
  getDepartmentsByFacultyId,
} from "@/utils/apiRequests/course.api";

const Model = ({ editId, isOpen, setIsOpen, modalRef, setEditId }) => {
  const [formData, setFormData] = useState({ status: "true" });
  const [btnEnable, setBtnEnable] = useState(false);
  const queryClient = useQueryClient();

  const { status, mutate } = useMutation({
    mutationFn: editId ? updateStudent : studentRegister,
    onSuccess: (res) => {
      queryClient.invalidateQueries(["students"]);
      setEditId("");
      toast(res.message);
    },
    onError: (err) => toast("Operation failed"),
  });

  const { data, refetch } = useQuery({
    queryFn: () => getStudentById(editId),
    queryKey: ["students", editId],
    enabled: false,
  });

  const { data: facultyData, refetch: facultyRefetch } = useQuery({
    queryFn: getAllFaculties,
    queryKey: ["faculties"],
  });

  const { data: departmentData, refetch: departmentRefetch } = useQuery({
    queryFn: () => formData.f_id && getDepartmentsByFacultyId(formData?.f_id),
    queryKey: ["departments", "faculties", formData?.f_id],
    enabled: false,
  });

  useEffect(() => {
    formData?.f_id && departmentRefetch();
  }, [formData.f_id]);

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  const onFormDataChanged = (e) => {
    if (e.target) {
      setFormData((curData) => ({
        ...curData,
        [e.target?.name]: e.target?.value,
      }));
    } else if (typeof e == "boolean") {
      setFormData((curData) => ({ ...curData, status: e.toString() }));
    } else {
      setFormData((curData) => ({
        ...curData,
        [e.split(":")[0]]: e.split(":")[1],
      }));
    }
  };

  const onFormSubmitted = () => {
    mutate(formData);
    setFormData({ status: "true" });
    setIsOpen(false);
  };

  const onFormReset = () => {
    setFormData({ status: "true" });
  };

  useEffect(() => {
    const isFormValid =
      formData.name &&
      formData.user_name &&
      formData.email &&
      formData.contact_no &&
      formData.address &&
      formData.f_id &&
      formData.d_id;
    setBtnEnable(isFormValid);
  }, [formData]);

  useEffect(() => {
    console.log(formData);
    editId && refetch();
  }, [editId]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-lg w-[425px] p-6"
          >
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="text-lg font-semibold">Student</h3>

              <GiCancel
                className="text-2xl hover:cursor-pointer hover:text-zinc-700"
                onClick={() => {
                  setIsOpen(false);
                  onFormReset();
                  setEditId("");
                }}
              />
            </div>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  className="col-span-3"
                  onChange={(e) => onFormDataChanged(e)}
                  value={formData.name || ""}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user_name" className="text-right">
                  User name
                </Label>
                <Input
                  id="user_name"
                  name="user_name"
                  className="col-span-3"
                  onChange={(e) => onFormDataChanged(e)}
                  value={formData.user_name || ""}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  className="col-span-3"
                  onChange={(e) => onFormDataChanged(e)}
                  value={formData.email || ""}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact_no" className="text-right">
                  Contact No
                </Label>
                <Input
                  id="contact_no"
                  name="contact_no"
                  className="col-span-3"
                  onChange={(e) => onFormDataChanged(e)}
                  value={formData.contact_no || ""}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  className="col-span-3"
                  onChange={(e) => onFormDataChanged(e)}
                  value={formData.address || ""}
                />
              </div>

              <div className={`grid grid-cols-4 items-center gap-4`}>
                <Label className="text-right">Faculty</Label>
                <Select
                  onValueChange={(e) => {
                    setFormData((cur) => ({ ...cur, d_id: "" }));
                    onFormDataChanged(e);
                  }}
                  value={formData.f_id ? "f_id:" + formData.f_id : ""}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyData?.map((item) => (
                      <SelectItem value={`f_id:${item.f_id}`}>
                        {item.f_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div
                className={`${
                  formData.f_id ? "grid" : "hidden"
                } grid-cols-4 items-center gap-4`}
              >
                <Label className="text-right">Department</Label>
                <Select
                  onValueChange={(e) => onFormDataChanged(e)}
                  value={formData.d_id ? "d_id:" + formData.d_id : ""}
                >
                  <SelectTrigger
                    disabled={!formData.f_id}
                    className={`w-[180px]`}
                  >
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentData?.map((item) => (
                      <SelectItem value={`d_id:${item.d_id}`} key={item.d_id}>
                        {item.d_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Label className="text-right">Status</Label>
                <div className="items-top flex space-x-2 col-span-3 items-center">
                  <Checkbox
                    id="status"
                    onCheckedChange={(e) => onFormDataChanged(e)}
                    checked={formData?.status === "true"}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="status"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Active
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between space-x-2 mt-4">
              <Button
                type="button"
                variant="warning"
                onClick={() => {
                  onFormReset();
                  editId && setFormData((cur) => ({ ...cur, s_id: data.s_id }));
                }}
              >
                Reset
              </Button>
              <Button
                type="button"
                disabled={!btnEnable}
                onClick={onFormSubmitted}
              >
                {editId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Model;