import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 9.2.6 - Template Gallery UI Component
 * Displays and manages project templates with search, filtering, and preview
 */
import { useState, useEffect, useMemo } from 'react';
{
    const [templates, setTemplates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [complexityFilter, setComplexityFilter] = useState('');
    const [sortBy, setSortBy] = useState('popularity');
    const [featuredTemplates, setFeaturedTemplates] = useState([]);
    useEffect(() => {
        loadTemplates();
        loadCategories();
        loadFeaturedTemplates();
    }, []);
    useEffect(() => {
        loadTemplates();
    }, [searchQuery, selectedCategory, complexityFilter, sortBy]);
    const loadTemplates = async () => {
        try {
            setLoading(true);
            const result = await templateManager.searchTemplates({});
            query: searchQuery || undefined,
                category;
            selectedCategory || undefined,
                complexity;
            complexityFilter || undefined,
                sort_by;
            sortBy,
                limit;
            50,
            ;
        }
        finally { }
        ;
        setTemplates(result.templates);
    };
    try { }
    catch (error) {
        console.error('Failed to load templates:', error);
    }
    finally {
        setLoading(false);
    }
    ;
    const loadCategories = async () => {
        try {
            const cats = templateManager.getCategories();
            setCategories(cats);
        }
        catch (error) {
            console.error('Failed to load categories:', error);
        }
        ;
        const loadFeaturedTemplates = async () => {
            try {
                const featured = await templateManager.getFeaturedTemplates();
                setFeaturedTemplates(featured);
            }
            catch (error) {
                console.error('Failed to load featured templates:', error);
            }
            ;
            const handleTemplateUse = (template) => {
                // For now, pass empty customizations - this could open a customization dialog
                onTemplateSelect(template, {});
            };
            const filteredTemplates = useMemo(() => {
                if (!searchQuery && !selectedCategory && !complexityFilter) {
                    return templates;
                    return templates;
                }
                [templates, searchQuery, selectedCategory, complexityFilter];
            });
            const _____complexityColors = {
                beginner: 'bg-green-100 text-green-800',
                intermediate: 'bg-yellow-100 text-yellow-800',
                advanced: 'bg-red-100 text-red-800',
            };
            return;
            _jsxs("div", { className: `template-gallery ${className}`, children: ["}", _jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Project Templates" }), _jsx("p", { className: "text-gray-600", children: "Choose from pre-built templates to accelerate your workflow" })] }), featuredTemplates.length > 0 && ()
                        < div, " className=\"mb-8\">", _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Featured Templates" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [featuredTemplates.slice(0, 3).map(template => ()
                                < TemplateCard, key = { template, : .id }, template = { template }, onUse = {}()), " => handleTemplateUse(template)} onPreview=", () => onTemplatePreview(template), "featured /> ))}"] })] });
        };
    };
}
{ /* Search and Filters */ }
_jsxs("div", { className: "mb-6 space-y-4", children: [_jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", placeholder: "Search templates...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" }), _jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx("svg", { className: "h-5 w-5 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }) })] }), _jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsxs("select", { value: selectedCategory, onChange: (e) => setSelectedCategory(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "", children: "All Categories" }), categories.map(category => ()
                            < option, key = { category, : .id }, value = { category, : .id } > { category, : .name })] }), "))}"] }), _jsxs("select", { value: complexityFilter, onChange: (e) => setComplexityFilter(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "", children: "All Levels" }), _jsx("option", { value: "beginner", children: "Beginner" }), _jsx("option", { value: "intermediate", children: "Intermediate" }), _jsx("option", { value: "advanced", children: "Advanced" })] }), _jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "popularity", children: "Most Popular" }), _jsx("option", { value: "rating", children: "Highest Rated" }), _jsx("option", { value: "newest", children: "Newest" }), _jsx("option", { value: "name", children: "Name A-Z" })] })] });
div >
    { /* Templates Grid */};
{
    loading ? ()
        < div : ;
    className = "flex justify-center items-center py-12" >
        _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" });
    div >
    ;
    ()
        < div;
    className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" >
        { filteredTemplates, : .map(template => ()
                < TemplateCard, key = { template, : .id }, template = { template }, onUse = {}(), handleTemplateUse(template)) };
    onPreview = {}();
    onTemplatePreview(template);
}
/>;
div >
;
{
    filteredTemplates.length === 0 && !loading && ()
        < div;
    className = "text-center py-12" >
        (_jsx("div", { className: "text-gray-400 mb-4", children: _jsx("svg", { className: "mx-auto h-12 w-12", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }) })
            ,
                _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No templates found" })
                    ,
                        _jsx("p", { className: "text-gray-500", children: "Try adjusting your search criteria or browse different categories." }));
    div >
    ;
}
div >
;
;
;
const TemplateCard = ({ template, onUse, onPreview, featured = false }) => {
    const complexityColors = {
        beginner: 'bg-green-100 text-green-800',
        intermediate: 'bg-yellow-100 text-yellow-800',
        advanced: 'bg-red-100 text-red-800',
    };
    return;
    _jsxs("div", { className: `bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border ${featured ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`, children: ["}", featured && ()
                < div, " className=\"bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-t-lg\"> Featured"] });
};
{ /* Preview Image */ }
_jsxs("div", { className: "h-32 bg-gray-100 rounded-t-lg flex items-center justify-center", children: [template.preview_image ? ()
            < img : , " src=", template.preview_image, " alt=", template.name, " className=\"w-full h-full object-cover rounded-t-lg\" /> ) : ()", _jsx("div", { className: "text-gray-400", children: _jsx("svg", { className: "h-12 w-12", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }) }), ")}"] })
    ,
        _jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsx("h3", { className: "font-semibold text-gray-900 truncate", children: template.name }), _jsxs("span", { className: `text-xs px-2 py-1 rounded-full ${complexityColors[template.complexity_level]}`, children: ["}", template.complexity_level] })] }), _jsx("p", { className: "text-sm text-gray-600 mb-3 line-clamp-2", children: template.description }), _jsx("div", { className: "flex flex-wrap gap-1 mb-3", children: template.tags.slice(0, 3).map(tag => ()
                        < span, key = { tag }, className = "text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded" >
                        { tag }) }), "))}", template.tags.length > 3 && ()
                    < span, " className=\"text-xs text-gray-500\">+", template.tags.length - 3, " more"] });
div >
    { /* Stats */}
    < div;
className = "flex items-center justify-between text-xs text-gray-500 mb-4" >
    (_jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("span", { className: "flex items-center", children: [_jsx("svg", { className: "h-4 w-4 mr-1 text-yellow-400", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" }) }), template.rating.toFixed(1)] }), _jsxs("span", { children: [template.usage_count, " uses"] })] })
        ,
            _jsxs("span", { children: [template.estimated_time, "m"] }));
div >
    { /* Author */}
    < div;
className = "flex items-center mb-4" >
    (_jsxs("div", { className: "h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center mr-2", children: [template.author.avatar ? ()
                < img : , " src=", template.author.avatar, " alt=", template.author.name, " className=\"h-6 w-6 rounded-full\" /> ) : ()", _jsx("span", { className: "text-xs text-gray-600", children: template.author.name[0] }), ")}"] })
        ,
            _jsx("span", { className: "text-xs text-gray-600", children: template.author.name }));
div >
    { /* Actions */}
    < div;
className = "flex space-x-2" >
    (_jsx("button", { onClick: onPreview, className: "flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors", children: "Preview" })
        ,
            _jsx("button", { onClick: onUse, className: "flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors", children: "Use Template" }));
div >
;
div >
;
div >
;
;
;
