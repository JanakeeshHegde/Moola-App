package com.moola.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "categories")
public class Category {

    @Id
    private String id;

    private Name name;

    @Indexed(unique = true)
    private String slug;

    private String icon;
    private String image;
    private int sortOrder = 0;
    private boolean isActive = true;

    public static class Name {
        private String en;
        private String kn;

        public Name() {}
        public Name(String en, String kn) {
            this.en = en;
            this.kn = kn;
        }

        public String getEn() { return en; }
        public void setEn(String en) { this.en = en; }

        public String getKn() { return kn; }
        public void setKn(String kn) { this.kn = kn; }
    }

    public Category() {}

    public Category(String slug, String enName, String knName, String icon, int sortOrder) {
        this.slug = slug;
        this.name = new Name(enName, knName);
        this.icon = icon;
        this.sortOrder = sortOrder;
        this.isActive = true;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Name getName() { return name; }
    public void setName(Name name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
