"use client";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GiCancel } from "react-icons/gi";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  createFaculty,
  getFacultyById,
  updateFaculty,
} from "@/utils/apiRequests/course.api";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getAllManagers } from "@/utils/apiRequests/user.api";
import { cn } from "@/lib/utils";

const Model = ({ editId, isOpen, setIsOpen, modalRef, setEditId }) => {
  const [formData, setFormData] = useState({ status: "true" });
  const [btnEnable, setBtnEnable] = useState(false);
  const queryClient = useQueryClient();
  const [comboBoxOpen, setComboBoxOpen] = useState(false);

  const { status, mutate } = useMutation({
    mutationFn: editId ? updateFaculty : createFaculty,
    onSuccess: (res) => {
      queryClient.invalidateQueries(["faculties"]);
      setEditId("");
      toast(res.message);
    },
    onError: (err) => toast("Operation failed"),
  });

  const { data, refetch } = useQuery({
    queryFn: () => getFacultyById(editId),
    queryKey: ["faculties", editId],
    enabled: false,
  });

  const {
    data: managers,
    isLoading,
    error,
  } = useQuery({
    queryFn: getAllManagers,
    queryKey: ["managers"],
  });

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

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
      formData.f_name && formData.email && formData.contact_no && formData.m_id;
    setBtnEnable(isFormValid);
  }, [formData]);

  useEffect(() => {
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
              <h3 className="text-lg font-semibold">Faculty</h3>

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
                <Label htmlFor="f_name" className="text-right">
                  Name
                </Label>
                <Input
                  id="f_name"
                  name="f_name"
                  className="col-span-3"
                  onChange={(e) => onFormDataChanged(e)}
                  value={formData.f_name || ""}
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

              <div className={`grid grid-cols-4 items-center gap-4`}>
                <Label className="text-right">Dean</Label>
                <div className="grid col-span-3">
                  <Popover open={comboBoxOpen} onOpenChange={setComboBoxOpen}>
                    <PopoverTrigger asChild>
                      <button
                        role="combobox"
                        aria-expanded={comboBoxOpen}
                        className="col-span-3 flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 cursor-pointer"
                      >
                        {formData.m_id
                          ? managers.find(
                              (manager) => manager.m_id == formData.m_id
                            )?.name
                          : "Select manager"}
                        <ChevronsUpDown className="opacity-50 size-[17px] " />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="py-0 px-1 border-none shadow-none">
                      <Command className="border shadow-md">
                        <CommandInput placeholder="Search manager" />
                        <CommandList>
                          <CommandEmpty>No manager found.</CommandEmpty>
                          <CommandGroup>
                            {managers.map((manager) => (
                              <CommandItem
                                key={manager.m_id}
                                value={
                                  manager.name + ":" + manager.m_id.toString()
                                }
                                onSelect={(currentValue) => {
                                  setFormData((cur) => ({
                                    ...cur,
                                    m_id:
                                      currentValue.split(":")[1] ==
                                      formData.m_id
                                        ? ""
                                        : currentValue.split(":")[1],
                                  }));
                                  setComboBoxOpen(false);
                                }}
                              >
                                {manager.name}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    formData.m_id == manager.m_id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
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
                  editId && setFormData((cur) => ({ ...cur, f_id: data.f_id }));
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