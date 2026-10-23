package com.moola.app.ui.complaint;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.moola.app.R;
import com.moola.app.data.model.Complaint;

import java.util.ArrayList;
import java.util.List;

public class ComplaintAdapter extends RecyclerView.Adapter<ComplaintAdapter.ViewHolder> {

    private List<Complaint> complaints = new ArrayList<>();

    public void setComplaints(List<Complaint> list) {
        this.complaints = list != null ? list : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_complaint_card, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Complaint complaint = complaints.get(position);

        holder.tvTicketId.setText(complaint.getTicketId());
        holder.tvStatus.setText(complaint.getStatus());
        holder.tvCategory.setText(complaint.getCategory() != null ? complaint.getCategory().replace("_", " ").toUpperCase() : "GENERAL");
        holder.tvSubject.setText(complaint.getSubject());
        holder.tvDescription.setText(complaint.getDescription());

        if (complaint.getPublicResponse() != null && !complaint.getPublicResponse().isBlank()) {
            holder.tvPublicReply.setText(complaint.getPublicResponse());
            holder.layoutPublicReply.setVisibility(View.VISIBLE);
        } else {
            holder.layoutPublicReply.setVisibility(View.GONE);
        }
    }

    @Override
    public int getItemCount() {
        return complaints.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvTicketId;
        TextView tvStatus;
        TextView tvCategory;
        TextView tvSubject;
        TextView tvDescription;
        LinearLayout layoutPublicReply;
        TextView tvPublicReply;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTicketId = itemView.findViewById(R.id.tvTicketId);
            tvStatus = itemView.findViewById(R.id.tvComplaintStatus);
            tvCategory = itemView.findViewById(R.id.tvComplaintCategory);
            tvSubject = itemView.findViewById(R.id.tvComplaintSubject);
            tvDescription = itemView.findViewById(R.id.tvComplaintDescription);
            layoutPublicReply = itemView.findViewById(R.id.layoutPublicReply);
            tvPublicReply = itemView.findViewById(R.id.tvPublicReplyText);
        }
    }
}
