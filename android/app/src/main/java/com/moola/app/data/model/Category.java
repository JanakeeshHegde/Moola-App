package com.moola.app.data.model;

import java.io.Serializable;

public class Category implements Serializable {
    private String id;
    private String slug;
    private Name name;
    private String icon;
    private String image;
    private int sortOrder;

    public static class Name implements Serializable {
        private String en;
        private String kn;

        public String getEn() { return en; }
        public String getKn() { return kn; }
    }

    public String getId() { return id; }
    public String getSlug() { return slug; }
    public Name getName() { return name; }
    public String getIcon() { return icon; }
    public String getImage() { return image; }
    public int getSortOrder() { return sortOrder; }

    public String getDisplayName() {
        if (name != null && name.getEn() != null) {
            return name.getEn();
        }
        return slug != null ? slug : "";
    }
}
